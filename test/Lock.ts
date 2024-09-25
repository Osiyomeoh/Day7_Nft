import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MyToken", function () {
  async function deployMyTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(owner.address);

    return { myToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
    });

    it("Should set the right owner", async function () {
      const { myToken, owner } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to safeMint a new token", async function () {
      const { myToken, owner, addr1 } = await loadFixture(deployMyTokenFixture);
      const tokenId = 1;
      const tokenURI = "https://example.com/token/1";

      await expect(myToken.safeMint(addr1.address, tokenId, tokenURI))
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, tokenId);

      expect(await myToken.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await myToken.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should fail if non-owner tries to safeMint", async function () {
      const { myToken, addr1 } = await loadFixture(deployMyTokenFixture);

      await expect(myToken.connect(addr1).safeMint(addr1.address, 1, "uri"))
        .to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
  });

  // describe("Burning", function () {
  //   it("Should allow token owner to burn their token", async function () {
  //     const { myToken, owner, addr1 } = await loadFixture(deployMyTokenFixture);
  //     const tokenId = 1;

  //     await myToken.safeMint(addr1.address, tokenId, "uri");
  //     await expect(myToken.connect(addr1).burn(tokenId))
  //       .to.emit(myToken, "Transfer")
  //       .withArgs(addr1.address, ethers.ZeroAddress, tokenId);

  //     await expect(myToken.ownerOf(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
  //   });
  // });

  describe("TokenURI", function () {
    it("Should return the correct token URI", async function () {
      const { myToken, addr1 } = await loadFixture(deployMyTokenFixture);
      const tokenId = 1;
      const tokenURI = "https://example.com/token/1";

      await myToken.safeMint(addr1.address, tokenId, tokenURI);
      expect(await myToken.tokenURI(tokenId)).to.equal(tokenURI);
    });

    // it("Should revert for non-existent token", async function () {
    //   const { myToken } = await loadFixture(deployMyTokenFixture);

    //   await expect(myToken.tokenURI(999)).to.be.revertedWith("ERC721: invalid token ID");
    // });
  });

  describe("SupportsInterface", function () {
    it("Should support ERC721 interface", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);
      const ERC721InterfaceId = "0x80ac58cd";
      expect(await myToken.supportsInterface(ERC721InterfaceId)).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);
      const ERC721MetadataInterfaceId = "0x5b5e139f";
      expect(await myToken.supportsInterface(ERC721MetadataInterfaceId)).to.be.true;
    });
  });
});