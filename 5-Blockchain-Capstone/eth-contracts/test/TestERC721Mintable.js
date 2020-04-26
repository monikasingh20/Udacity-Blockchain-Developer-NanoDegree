var ERC721MintableComplete = artifacts.require('CustomERC721Token');
const truffleAssert = require('truffle-assertions');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    const tokenHolder1 = accounts[2];
    const tokenHolder2 = accounts[3];
    const tokenHolder3 = accounts[4];

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new({from: account_one});

            // TODO: mint multiple tokens

            await this.contract.mint(tokenHolder1, 1, {from: account_one});
            await this.contract.mint(tokenHolder2, 2, {from: account_one});
            await this.contract.mint(tokenHolder2, 3, {from: account_one});
            await this.contract.mint(tokenHolder3, 4, {from: account_one});
            await this.contract.mint(tokenHolder3, 5, {from: account_one});
            await this.contract.mint(tokenHolder3, 6, {from: account_one});
        })

        it('should return total supply', async function () {
            let totalSupply = await this.contract.totalSupply.call();
            assert.equal(totalSupply.toNumber(), 6, "Wrong total supply");
            
        })

        it('should get token balance', async function () {
            let balance = await this.contract.balanceOf.call(tokenHolder1);
            assert.equal(balance, 1, "Incorrect balance for tokenHolder1");
            
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            let token_uri = await this.contract.tokenURI.call(1);

            assert.equal(token_uri, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1","wrong token uri");
        })

        it('should transfer token from one owner to another', async function () {
            let _tokenId = 1;

            let _owner = await this.contract.ownerOf.call(_tokenId);
            assert.equal(_owner, tokenHolder1, "Wrong initial owner of token");

            let tx = await this.contract.transferFrom(tokenHolder1, account_two, _tokenId, {from: tokenHolder1});
            await truffleAssert.eventEmitted(tx, "Transfer", (event) => {
                return (
                    event.from == tokenHolder1 &&
                    event.to == account_two &&
                    event.tokenId == _tokenId
                );
            });
            _owner = await this.contract.ownerOf.call(_tokenId);
            assert.equal(_owner, account_two, "Wrong owner of token after transfer");
            // transfer back
            await this.contract.transferFrom(
                account_two, tokenHolder1, _tokenId, {from: account_two});
            
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            await truffleAssert.reverts(this.contract.mint(account_two, 99, {from: account_two})
            );
        })

        it('should return contract owner', async function () { 
            let owner = await this.contract.getOwner.call();
            assert.equal(account_one, owner, "Wrong owner returned");
        })

    });
})