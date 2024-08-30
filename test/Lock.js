const { expect } = require('chai');
const { ethers } = require('hardhat');
const { constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('Token test', function () {
    let deployer, firstAccount, secondAccount, thirdAccount;
    let blacklist, token;

    it('deployed', async () => {
        [deployer, firstAccount, secondAccount, thirdAccount] = await ethers.getSigners();

        // Deploy the Blacklist contract
        const Blacklist = await ethers.getContractFactory('Blacklist');
        blacklist = await Blacklist.deploy();
        await blacklist.waitForDeployment();
        const blacklistAddress = await blacklist.getAddress();

        // Deploy the Token contract
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy("First Token", "FT1", blacklistAddress);
        await blacklist.waitForDeployment();
        const tokenAddress = await token.getAddress();

        console.log("Owner:", deployer.address);
        expect(blacklistAddress).to.not.equal(ZERO_ADDRESS);
        expect(blacklistAddress).to.match(/0x[0-9a-fA-F]{40}/);
        console.log("new Blacklist address: ", blacklistAddress);

        expect(tokenAddress).to.not.equal(ZERO_ADDRESS);
        expect(tokenAddress).to.match(/0x[0-9a-fA-F]{40}/);
        console.log("new Token address: ", tokenAddress);
        expect(deployer.address).to.be.equal(await token.owner());
    });

    it('is Blacklisted', async () => {
        if (!blacklist || !token) throw new Error("Contracts not deployed!");

        await blacklist.setBlacklist([thirdAccount.address]);
        expect(await blacklist.isBlacklisted(thirdAccount.address)).to.equal(true);
    });

    it('mint ok', async () => {
        if (!blacklist || !token) throw new Error("Contracts not deployed!");

        await token.mint(firstAccount.address, ethers.parseEther("50"));
        expect(ethers.formatEther(await token.balanceOf(firstAccount.address))).to.equal("50.0");
    });

    it('mint not possible', async () => {
        if (!blacklist || !token) throw new Error("Contracts not deployed!");

        await blacklist.setBlacklist([thirdAccount.address]);

        await expectRevert(
            token.mint(thirdAccount.address, ethers.parseEther("100")),
            "Address is blacklisted"
        );
    });

    it('remove from Blacklist', async () => {
        if (!blacklist || !token) throw new Error("Contracts not deployed!");

        await blacklist.resetBlacklist([thirdAccount.address]);
        expect(await blacklist.isBlacklisted(thirdAccount.address)).to.equal(false);
    });

    it('transfer ok', async () => {
        if (!blacklist || !token) throw new Error("Contracts not deployed!");

        await token.connect(firstAccount).transfer(secondAccount.address, ethers.parseEther("5"));
        expect(ethers.formatEther(await token.balanceOf(secondAccount.address))).to.equal("5.0");
    });

    it('transferFrom ok', async () => {
        if (!blacklist || !token) throw new Error("Contracts not deployed!");

        await token.connect(firstAccount).approve(deployer.address, ethers.parseEther("5"));
        await token.transferFrom(firstAccount.address, secondAccount.address, ethers.parseEther("5"));
        expect(ethers.formatEther(await token.balanceOf(secondAccount.address))).to.equal("10.0");
    });
});
