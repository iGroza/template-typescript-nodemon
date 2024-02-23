# HAQQ Network fee tester

## Getting started

1. `cp .env.example .env` 
2. Setup `PRIVATE_KEY` variable
3. `yarn && yarn develop`
   
## Fee calculation methods

`estimateTxWithStrictFee(provider, txRequest, ethers.parseEther('1'))` - use 1 ISLM for fee

`estimateTxWithMinimumFee(provider, txRequest)` - minimum valid fee

`estimateTxWithLegacyNormalFee(provider, txRequest)` - normal fee with legacy gasPrice param

`estimateTxWithNormalFee(provider, txRequest)` - normal fee

`estimateTxWithHightFee(provider, txRequest)` - x2 fee
  