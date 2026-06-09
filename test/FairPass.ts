// test/FairPass.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { parseEther, getAddress, zeroAddress } from "viem";

const { viem, networkHelpers } = await hre.network.create({ chainType: "l1" });

describe("Sistema Completo FairPass", function () {

  // ─── Fixtures ────────────────────────────────────────────────────────────────

  async function deploySistemaFixture() {
    const [owner, organizer, buyer1, buyer2] = await viem.getWalletClients();

    const marketplace = await viem.deployContract("FairPassMarketplace", []);
    const factory = await viem.deployContract("FairPassEventFactory", [marketplace.address]);

    const ticketPrice = parseEther("0.05");
    const maxSupply = 3n;
    const eventTimestamp = BigInt(await networkHelpers.time.latest()) + 86400n;

    return { owner, organizer, buyer1, buyer2, marketplace, factory, ticketPrice, maxSupply, eventTimestamp };
  }

  async function deployComEventoFixture() {
    const base = await networkHelpers.loadFixture(deploySistemaFixture);

    await base.factory.write.createEvent([
      "Festival Transparente", "FT",
      base.ticketPrice, base.maxSupply, base.eventTimestamp,
    ], { account: base.organizer.account });

    const events = await base.factory.read.getAllEvents();
    const eventContract = await viem.getContractAt("FairPassEvent", events[0]);

    return { ...base, eventContract };
  }

  async function deployComIngressosFixture() {
    const base = await networkHelpers.loadFixture(deployComEventoFixture);

    await base.eventContract.write.mintTicket({
      account: base.buyer1.account,
      value: base.ticketPrice,
    });

    return base;
  }

  async function deployMarketplaceCompletoFixture() {
    const base = await networkHelpers.loadFixture(deployComEventoFixture);

    await base.eventContract.write.mintTicket({ account: base.buyer1.account, value: base.ticketPrice }); // Token 1
    await base.eventContract.write.mintTicket({ account: base.buyer2.account, value: base.ticketPrice }); // Token 2

    return base;
  }

  // ─── 1. FairPassEventFactory ──────────────────────────────────────────────────

  describe("1. FairPassEventFactory", function () {

    it("Deve reverter ao criar Factory com endereço zero do Marketplace", async function () {
      // Sem instância do contrato — deployContract falha antes de existir, usamos assert.rejects
      await assert.rejects(
        viem.deployContract("FairPassEventFactory", [zeroAddress])
      );
    });

    it("Deve reverter ao criar evento com data retroativa", async function () {
      const { factory, ticketPrice } = await networkHelpers.loadFixture(deploySistemaFixture);
      const passado = BigInt(await networkHelpers.time.latest()) - 100n;

      await viem.assertions.revertWithCustomError(
        factory.write.createEvent(["Show", "SHW", ticketPrice, 100n, passado]),
        factory,
        "InvalidEventDate"
      );
    });

    it("Deve reverter ao criar evento com maxSupply zero", async function () {
      const { factory, ticketPrice } = await networkHelpers.loadFixture(deploySistemaFixture);
      const amanha = BigInt(await networkHelpers.time.latest()) + 86400n;

      await viem.assertions.revertWithCustomError(
        factory.write.createEvent(["Show", "SHW", ticketPrice, 0n, amanha]),
        factory,
        "InvalidMaxSupply"
      );
    });

    it("Deve criar evento e indexar corretamente no getAllEvents", async function () {
      const { factory, organizer, ticketPrice, maxSupply, eventTimestamp } =
        await networkHelpers.loadFixture(deploySistemaFixture);

      await factory.write.createEvent(
        ["Rock", "RCK", ticketPrice, maxSupply, eventTimestamp],
        { account: organizer.account }
      );

      const events = await factory.read.getAllEvents();
      assert.strictEqual(events.length, 1);
    });

    it("Deve receber ETH via receive() e permitir saque pelo owner", async function () {
      const { factory, owner, buyer1 } = await networkHelpers.loadFixture(deploySistemaFixture);

      await buyer1.sendTransaction({ to: factory.address, value: parseEther("1.0") });

      const tx = await factory.write.withdrawFunds({ account: owner.account });
      assert.strictEqual(typeof tx, "string");
    });

    it("Deve reverter saque na Factory se não for o owner", async function () {
      const { factory, buyer1 } = await networkHelpers.loadFixture(deploySistemaFixture);

      await buyer1.sendTransaction({ to: factory.address, value: parseEther("1.0") });

      await assert.rejects(
        factory.write.withdrawFunds({ account: buyer1.account })
      );
    });

    it("Deve reverter saque na Factory se saldo for zero", async function () {
      const { factory, owner } = await networkHelpers.loadFixture(deploySistemaFixture);

      await viem.assertions.revertWithCustomError(
        factory.write.withdrawFunds({ account: owner.account }),
        factory,
        "NoBalance"
      );
    });
  });

  // ─── 2. FairPassEvent — Ciclo de Venda ───────────────────────────────────────

  describe("2. FairPassEvent — Ciclo de Venda & Regras", function () {

    it("Deve impedir transferência P2P direta (trava do ecossistema)", async function () {
      const { eventContract, buyer1, buyer2, ticketPrice } =
        await networkHelpers.loadFixture(deployComEventoFixture);

      await eventContract.write.mintTicket({ account: buyer1.account, value: ticketPrice });

      await viem.assertions.revertWithCustomError(
        eventContract.write.safeTransferFrom(
          [buyer1.account.address, buyer2.account.address, 1n],
          { account: buyer1.account }
        ),
        eventContract,
        "TicketTransferFailed"
      );
    });

    it("Deve reverter mintTicket com valor errado", async function () {
      const { eventContract, buyer1 } = await networkHelpers.loadFixture(deployComEventoFixture);

      await viem.assertions.revertWithCustomError(
        eventContract.write.mintTicket({ account: buyer1.account, value: parseEther("0.01") }),
        eventContract,
        "WrongValuePayment"
      );
    });

    it("Deve limitar a 1 ingresso por endereço", async function () {
      const { eventContract, buyer1, ticketPrice } =
        await networkHelpers.loadFixture(deployComEventoFixture);

      await eventContract.write.mintTicket({ account: buyer1.account, value: ticketPrice });

      await viem.assertions.revertWithCustomError(
        eventContract.write.mintTicket({ account: buyer1.account, value: ticketPrice }),
        eventContract,
        "MaxTicketsNumber"
      );
    });

    it("Deve retornar hasTicket false para quem não tem ingresso", async function () {
      const { eventContract, buyer2 } = await networkHelpers.loadFixture(deployComEventoFixture);

      const [hasTicket, tokenId] = await eventContract.read.userTicket([
        buyer2.account.address,
      ]);

      assert.strictEqual(hasTicket, false);
      assert.strictEqual(tokenId, 0n);
    });

    it("Deve barrar novas vendas quando maxSupply for atingido", async function () {
      const { eventContract, ticketPrice, buyer1, buyer2 } =
        await networkHelpers.loadFixture(deployComEventoFixture);
      const wallets = await viem.getWalletClients();

      await eventContract.write.mintTicket({ account: buyer1.account, value: ticketPrice });
      await eventContract.write.mintTicket({ account: buyer2.account, value: ticketPrice });
      await eventContract.write.mintTicket({ account: wallets[4].account, value: ticketPrice });

      await viem.assertions.revertWithCustomError(
        eventContract.write.mintTicket({ account: wallets[5].account, value: ticketPrice }),
        eventContract,
        "OutOfTickets"
      );
    });

    it("Deve reverter mintTicket após o timestamp do evento", async function () {
      const { eventContract, buyer1, ticketPrice, eventTimestamp } =
        await networkHelpers.loadFixture(deployComEventoFixture);

      await networkHelpers.time.increaseTo(Number(eventTimestamp) + 10);

      await viem.assertions.revertWithCustomError(
        eventContract.write.mintTicket({ account: buyer1.account, value: ticketPrice }),
        eventContract,
        "EventTimestampWrong"
      );
    });
  });

  // ─── 3. FairPassEvent — Gerenciamento & Reembolsos ───────────────────────────

  describe("3. FairPassEvent — Gerenciamento do Organizador & Reembolsos", function () {

    it("Deve impedir conclusão por quem não for o owner", async function () {
      const { eventContract, buyer1 } = await networkHelpers.loadFixture(deployComIngressosFixture);

      await assert.rejects(
        eventContract.write.concludeEvent({ account: buyer1.account })
      );
    });

    it("Deve reverter concludeEvent antes do timestamp do evento", async function () {
      const { eventContract, organizer } = await networkHelpers.loadFixture(deployComIngressosFixture);

      await viem.assertions.revertWithCustomError(
        eventContract.write.concludeEvent({ account: organizer.account }),
        eventContract,
        "EventTimestampWrong"
      );
    });

    it("Deve reverter withdrawFunds se o evento não estiver Concluído", async function () {
      const { eventContract, organizer } = await networkHelpers.loadFixture(deployComIngressosFixture);

      await viem.assertions.revertWithCustomError(
        eventContract.write.withdrawFunds({ account: organizer.account }),
        eventContract,
        "EventNotCompleted"
      );
    });

    it("Deve concluir o evento, cobrar 1% de taxa e enviar o restante ao organizador", async function () {
      const { eventContract, organizer, eventTimestamp } =
        await networkHelpers.loadFixture(deployComIngressosFixture);

      await networkHelpers.time.increaseTo(Number(eventTimestamp) + 10);
      await eventContract.write.concludeEvent({ account: organizer.account });

      const tx = await eventContract.write.withdrawFunds({ account: organizer.account });
      assert.strictEqual(typeof tx, "string");

      const saldo = await eventContract.read.getContractBalance();
      assert.strictEqual(saldo, 0n);
    });

    it("Deve reverter cancelamento por quem não for o owner", async function () {
      const { eventContract, buyer1 } = await networkHelpers.loadFixture(deployComIngressosFixture);

      await assert.rejects(
        eventContract.write.cancelEvent({ account: buyer1.account })
      );
    });

    it("Deve reverter refundTicket se o evento não estiver cancelado", async function () {
      const { eventContract, buyer1 } = await networkHelpers.loadFixture(deployComIngressosFixture);

      await viem.assertions.revertWithCustomError(
        eventContract.write.refundTicket([1n], { account: buyer1.account }),
        eventContract,
        "EventNotCanceled"
      );
    });

    it("Deve reverter refundTicket se o caller não for o dono do token", async function () {
      const { eventContract, organizer } = await networkHelpers.loadFixture(deployComIngressosFixture);
      const wallets = await viem.getWalletClients();

      await eventContract.write.cancelEvent({ account: organizer.account });

      await viem.assertions.revertWithCustomError(
        eventContract.write.refundTicket([1n], { account: wallets[5].account }),
        eventContract,
        "NotOwner"
      );
    });

    it("Deve reembolsar o comprador e queimar o token ao cancelar", async function () {
      const { eventContract, organizer, buyer1 } =
        await networkHelpers.loadFixture(deployComIngressosFixture);

      await eventContract.write.cancelEvent({ account: organizer.account });
      await eventContract.write.refundTicket([1n], { account: buyer1.account });

      // Token queimado — ownerOf deve reverter
      await assert.rejects(eventContract.read.ownerOf([1n]));

      const [hasTicket, tokenId] = await eventContract.read.userTicket([
        buyer1.account.address,
      ]);
      assert.strictEqual(hasTicket, false);
      assert.strictEqual(tokenId, 0n);
    });
  });

  // ─── 4. FairPassMarketplace ───────────────────────────────────────────────────

  describe("4. FairPassMarketplace — Mercado Secundário", function () {

    it("Deve reverter listagem por quem não for o dono do ingresso", async function () {
      const { marketplace, eventContract, buyer2, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);

      await viem.assertions.revertWithCustomError(
        marketplace.write.listTicket([eventContract.address, 1n, ticketPrice], { account: buyer2.account }),
        marketplace,
        "NotTicketOwner"
      );
    });

    it("Deve reverter listagem com preço acima do teto", async function () {
      const { marketplace, eventContract, buyer1, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);

      await viem.assertions.revertWithCustomError(
        marketplace.write.listTicket([eventContract.address, 1n, ticketPrice + 1n], { account: buyer1.account }),
        marketplace,
        "ListPriceTooHigh"
      );
    });

    it("Deve listar e depois cancelar a listagem corretamente", async function () {
      const { marketplace, eventContract, buyer1, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);

      await eventContract.write.approve([marketplace.address, 1n], { account: buyer1.account });
      await marketplace.write.listTicket([eventContract.address, 1n, ticketPrice], { account: buyer1.account });
      await marketplace.write.cancelListing([eventContract.address, 1n], { account: buyer1.account });

      assert.strictEqual(
        await eventContract.read.ownerOf([1n]),
        getAddress(buyer1.account.address)
      );
    });

    it("Deve reverter buyTicket se o ticket não estiver listado", async function () {
      const { marketplace, eventContract } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);

      await viem.assertions.revertWithCustomError(
        marketplace.write.buyTicket([eventContract.address, 99n], { value: parseEther("0.05") }),
        marketplace,
        "TicketNotListed"
      );
    });

    it("Deve reverter buyTicket com valor errado", async function () {
      const { marketplace, eventContract, buyer1, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);

      await eventContract.write.approve([marketplace.address, 1n], { account: buyer1.account });
      await marketplace.write.listTicket([eventContract.address, 1n, ticketPrice], { account: buyer1.account });

      await viem.assertions.revertWithCustomError(
        marketplace.write.buyTicket([eventContract.address, 1n], { value: parseEther("0.01") }),
        marketplace,
        "WrongPaymentValue"
      );
    });

    it("Deve processar compra de revenda e atualizar ownership corretamente", async function () {
      const { marketplace, eventContract, buyer1, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);
      const wallets = await viem.getWalletClients();
      const compradorFinal = wallets[4];

      await eventContract.write.approve([marketplace.address, 1n], { account: buyer1.account });
      await marketplace.write.listTicket([eventContract.address, 1n, ticketPrice], { account: buyer1.account });
      await marketplace.write.buyTicket([eventContract.address, 1n], {
        account: compradorFinal.account,
        value: ticketPrice,
      });

      assert.strictEqual(
        await eventContract.read.ownerOf([1n]),
        getAddress(compradorFinal.account.address)
      );

      const [hasTicketFinal, tokenIdFinal] = await eventContract.read.userTicket([
        compradorFinal.account.address,
      ]);
      assert.strictEqual(hasTicketFinal, true);
      assert.strictEqual(tokenIdFinal, 1n);

      const [hasTicketBuyer1, tokenIdBuyer1] = await eventContract.read.userTicket([
        buyer1.account.address,
      ]);
      assert.strictEqual(hasTicketBuyer1, false);
      assert.strictEqual(tokenIdBuyer1, 0n);
    });

    it("Deve permitir reembolso ao novo dono após revenda e cancelamento do evento", async function () {
      const { marketplace, eventContract, buyer1, organizer, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);
      const wallets = await viem.getWalletClients();
      const compradorFinal = wallets[4];

      await eventContract.write.approve([marketplace.address, 1n], { account: buyer1.account });
      await marketplace.write.listTicket([eventContract.address, 1n, ticketPrice], { account: buyer1.account });
      await marketplace.write.buyTicket([eventContract.address, 1n], {
        account: compradorFinal.account,
        value: ticketPrice,
      });

      await eventContract.write.cancelEvent({ account: organizer.account });

      await viem.assertions.revertWithCustomError(
        eventContract.write.refundTicket([1n], { account: buyer1.account }),
        eventContract,
        "NotOwner"
      );

      const tx = await eventContract.write.refundTicket([1n], { account: compradorFinal.account });
      assert.strictEqual(typeof tx, "string");
    });

    it("Deve lidar corretamente com múltiplas listagens e delistagem", async function () {
      const { marketplace, eventContract, buyer1, buyer2, ticketPrice } =
        await networkHelpers.loadFixture(deployMarketplaceCompletoFixture);

      await eventContract.write.approve([marketplace.address, 1n], { account: buyer1.account });
      await marketplace.write.listTicket([eventContract.address, 1n, ticketPrice], { account: buyer1.account });

      await eventContract.write.approve([marketplace.address, 2n], { account: buyer2.account });
      await marketplace.write.listTicket([eventContract.address, 2n, ticketPrice], { account: buyer2.account });

      await marketplace.write.cancelListing([eventContract.address, 1n], { account: buyer1.account });

      const listings = await marketplace.read.getAllListings();
      assert.strictEqual(listings.length, 1);
      assert.strictEqual(listings[0].tokenId, 2n);
    });
  });
});