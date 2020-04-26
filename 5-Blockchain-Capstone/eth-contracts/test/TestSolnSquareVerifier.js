const SquareVerifier = artifacts.require('./SquareVerifier');
const SolnSquareVerifier = artifacts.require('./SolnSquareVerifier');
const truffleAssert = require('truffle-assertions');

// Test if a new solution can be added for contract - SolnSquareVerifier

// Test if an ERC721 token can be minted for contract - SolnSquareVerifier


contract('Test SolnSquareVerifier', accounts => {

    const owner = accounts[0];
    const tokenHolder = accounts[1];
    const account2 = accounts[2];

    describe('test token minting by providing solution', () => {
        beforeEach(async () => {
            const squareContract = await SquareVerifier.new({from: owner});
            this.contract = await SolnSquareVerifier.new(
                squareContract.address, {from: owner}
            );
        });

        // Test if a new solution can be added for contract - SolnSquareVerifier
        it('should mint token for correct proof', async () => {
            let tokenId = 101;
            let tx = await this.contract.mintToken(
                tokenHolder,
                tokenId,
                 ["0x1ba0df5159c4c75da8a30d34e28b0a2242b9634aed77c9b41b979e6081ed5033", "0x04a81e18c8c57362b000213bce6d533055ba4f830dc76abf9c5bf37907ffbdd0"],
                 [["0x272c1132c59a11b904df2e3921eaf7b40ce948a1a24e9b36dd6e2e04cc3e9560", "0x1535e1e6c5cb4d685ef68595487910d68d8813765f422b977b53e32f8c53fc94"], ["0x26e8a26d9bd754c038c42bb9b5b32b91a0c1463aba53b03eb8e224f1230f853a", "0x2c080f65faca972f26229da56b338fc12d62261f8626ec42659bc1090e7a983d"]],
                 ["0x08c833d09a989255fa84bd16e9b4374fbf2c59f92f8b67298771b72c03e56f7f", "0x2f85944aef8c9f217463077e0d8f85fdf5546b3b570820ade0cf9c95a3feb440"],
                 ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000001"]);

            await truffleAssert.eventEmitted(tx, "True", (ev) => {
                return (ev.to == tokenHolder && ev.tokenId == tokenId);
            });
            let _owner = await this.contract.ownerOf.call(tokenId);
            assert.equal(_owner, tokenHolder, "Invalid owner of token");
            let bal = await this.contract.balanceOf.call(tokenHolder);
            assert.equal(bal, 1, "Wrong balance for tokenHolder after mint");
        });

        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        it('should not mint token for incorrect proof', async () => {
            let tokenId = 999;
             let tx = await this.contract.mintToken(
                account2,
                tokenId,
                 ["0x1ba0df5159c4c75da8a30d34e28b0a2242b9634aed77c9b41b979e6081ed5033", "0x04a81e18c8c57362b000213bce6d533055ba4f830dc76abf9c5bf37907ffbdd0"],
                 [["0x272c1132c59a11b904df2e3921eaf7b40ce948a1a24e9b36dd6e2e04cc3e9560", "0x1535e1e6c5cb4d685ef68595487910d68d8813765f422b977b53e32f8c53fc94"], ["0x26e8a26d9bd754c038c42bb9b5b32b91a0c1463aba53b03eb8e224f1230f853a", "0x2c080f65faca972f26229da56b338fc12d62261f8626ec42659bc1090e7a983d"]],
                 ["0x08c833d09a989255fa84bd16e9b4374fbf2c59f92f8b67298771b72c03e56f7f", "0x2f85944aef8c9f217463077e0d8f85fdf5546b3b570820ade0cf9c95a3feb440"],
                 ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000000"]);

//            await truffleAssert.reverts(tx);
            await truffleAssert.eventEmitted(tx, "False", (ev) => {
                return (ev.to == account2 && ev.tokenId == tokenId);
            });
            let _owner = await this.contract.ownerOf.call(randomAcc);
            assert.equal(
                _owner, "0x0000000000000000000000000000000000000000",
                "incorrect proof"
            );
            let bal = await this.contract.balanceOf.call(randomAcc);
            assert.equal(bal, 0, "Incorrect balance for account2 after invalid mint");
        });
    });
});