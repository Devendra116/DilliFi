const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HumanVerificationRegistry", function () {
  let humanVerificationRegistry;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Mock addresses for testing
    const identityVerificationHubV2Address = ethers.ZeroAddress;
    const scope = 1;
    const verificationConfigId = ethers.keccak256(ethers.toUtf8Bytes("test-human-verification"));

    // Deploy HumanVerificationRegistry
    const HumanVerificationRegistry = await ethers.getContractFactory("HumanVerificationRegistry");
    humanVerificationRegistry = await HumanVerificationRegistry.deploy(
      identityVerificationHubV2Address,
      scope,
      verificationConfigId,
      owner.address
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await humanVerificationRegistry.getTotalHumans()).to.equal(0);
      expect(await humanVerificationRegistry.owner()).to.equal(owner.address);
      expect(await humanVerificationRegistry.isHuman(addr1.address)).to.be.false;
    });

    it("Should have correct verification config ID", async function () {
      const configId = await humanVerificationRegistry.getConfigId(ethers.ZeroHash, ethers.ZeroHash, "0x");
      expect(configId).to.not.equal(ethers.ZeroHash);
    });

    it("Should initialize with empty verified addresses array", async function () {
      const allAddresses = await humanVerificationRegistry.getAllVerifiedAddresses();
      expect(allAddresses.length).to.equal(0);
    });
  });

  describe("Human Verification Status", function () {
    it("Should return false for unverified addresses", async function () {
      expect(await humanVerificationRegistry.isHuman(addr1.address)).to.be.false;
      expect(await humanVerificationRegistry.isHuman(addr2.address)).to.be.false;
    });

    it("Should return correct verification details for unverified addresses", async function () {
      const [verified, timestamp, id] = await humanVerificationRegistry.getVerificationDetails(addr1.address);
      expect(verified).to.be.false;
      expect(timestamp).to.equal(0);
      expect(id).to.equal(ethers.ZeroHash);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to set scope", async function () {
      const newScope = 2;
      await humanVerificationRegistry.setScope(newScope);
      // Note: We can't directly test the internal scope, but the transaction should succeed
    });

    it("Should allow owner to set config ID", async function () {
      const newConfigId = ethers.keccak256(ethers.toUtf8Bytes("new-config"));
      await humanVerificationRegistry.setConfigId(newConfigId);
      
      const retrievedConfigId = await humanVerificationRegistry.getConfigId(ethers.ZeroHash, ethers.ZeroHash, "0x");
      expect(retrievedConfigId).to.equal(newConfigId);
    });

    it("Should not allow non-owner to set scope", async function () {
      const newScope = 2;
      await expect(
        humanVerificationRegistry.connect(addr1).setScope(newScope)
      ).to.be.revertedWithCustomError(humanVerificationRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should not allow non-owner to set config ID", async function () {
      const newConfigId = ethers.keccak256(ethers.toUtf8Bytes("new-config"));
      await expect(
        humanVerificationRegistry.connect(addr1).setConfigId(newConfigId)
      ).to.be.revertedWithCustomError(humanVerificationRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Statistics and Queries", function () {
    it("Should return correct total humans count", async function () {
      expect(await humanVerificationRegistry.getTotalHumans()).to.equal(0);
    });

    it("Should return correct verifications in range", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const count = await humanVerificationRegistry.getVerificationsInRange(0, currentTime);
      expect(count).to.equal(0);
    });

    it("Should return correct verifications in specific range", async function () {
      const startTime = 1000;
      const endTime = 2000;
      const count = await humanVerificationRegistry.getVerificationsInRange(startTime, endTime);
      expect(count).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero address queries", async function () {
      expect(await humanVerificationRegistry.isHuman(ethers.ZeroAddress)).to.be.false;
    });

    it("Should handle verification details for zero address", async function () {
      const [verified, timestamp, id] = await humanVerificationRegistry.getVerificationDetails(ethers.ZeroAddress);
      expect(verified).to.be.false;
      expect(timestamp).to.equal(0);
      expect(id).to.equal(ethers.ZeroHash);
    });

    it("Should handle empty verification config ID", async function () {
      const emptyConfigId = ethers.ZeroHash;
      await humanVerificationRegistry.setConfigId(emptyConfigId);
      
      const retrievedConfigId = await humanVerificationRegistry.getConfigId(ethers.ZeroHash, ethers.ZeroHash, "0x");
      expect(retrievedConfigId).to.equal(emptyConfigId);
    });
  });

  describe("Access Control", function () {
    it("Should have correct owner after deployment", async function () {
      expect(await humanVerificationRegistry.owner()).to.equal(owner.address);
    });

    it("Should allow owner to call owner functions", async function () {
      const newConfigId = ethers.keccak256(ethers.toUtf8Bytes("owner-test"));
      await expect(humanVerificationRegistry.setConfigId(newConfigId))
        .to.not.be.reverted;
    });
  });

  describe("Contract State", function () {
    it("Should maintain state consistency", async function () {
      const totalHumans = await humanVerificationRegistry.getTotalHumans();
      const allAddresses = await humanVerificationRegistry.getAllVerifiedAddresses();
      
      expect(totalHumans).to.equal(allAddresses.length);
    });

    it("Should have consistent verification config ID", async function () {
      const configId1 = await humanVerificationRegistry.getConfigId(ethers.ZeroHash, ethers.ZeroHash, "0x");
      const configId2 = await humanVerificationRegistry.getConfigId(ethers.ZeroHash, ethers.ZeroHash, "0x");
      
      expect(configId1).to.equal(configId2);
    });
  });
});
