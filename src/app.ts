import { ethers } from 'ethers';
import { DECIMALS_WEI, getEffectiveGasPrice } from './get-effective-gas-price';

const providers = {
    TestEdge2: {
        "name": "TestEdge2",
        "ethRpcEndpoint": "https://rpc.eth.testedge2.haqq.network",
        "ethChainId": 54211,
        "explorer": "https://explorer.testedge2.haqq.network/",
    },
    Mainnet: {
        "name": "Mainnet",
        "ethRpcEndpoint": "https://rpc.eth.haqq.network",
        "ethChainId": 11235,
        "explorer": "https://explorer.haqq.network/",
    }
}

const getRpcEthersProvider = (providerName: keyof typeof providers) => {
    const providerJson = providers[providerName];
    const provider = new ethers.JsonRpcProvider(providerJson.ethRpcEndpoint, providerJson.ethChainId);
    return {
        provider,
        providerJson,
        getExplorerTxUrl: (txHash: string) => `${providerJson.explorer}tx/${txHash}`,
        getExplorerAddressUrl: (address: string) => `${providerJson.explorer}address/${address}`,
    }
}

const printSeparator = (name?: string) => console.log(`<========================> ${name ? `[${name.toUpperCase()}]` : '@'} <========================>`);

async function estimateTxWithStrictFee(provider: ethers.Provider, tx: ethers.TransactionRequest, totalFeeEthers: bigint): Promise<ethers.TransactionRequest> {
    const feeData = await provider.getFeeData();
    const gasPrice = ethers.FixedNumber.fromValue(feeData.gasPrice!, DECIMALS_WEI);
    const estimatedGasLimit = await provider.estimateGas({
        from: tx.from,
        to: tx.to,
        value: tx.value ?? '0x',
        data: tx.data ?? '0x'
    })
    const gasLimit = ethers.FixedNumber.fromValue(estimatedGasLimit, 0)
    const requiredFee = gasPrice.mul(gasLimit);
    const totalFee = ethers.FixedNumber.fromValue(totalFeeEthers, DECIMALS_WEI).sub(requiredFee).div(gasLimit)

    const expectedFee = gasLimit.mul(totalFee)
    console.log('🪙  expected fee ~', ethers.formatEther(expectedFee.value), 'ISLM');
    return {
        ...tx,
        gasLimit: estimatedGasLimit,
        maxFeePerGas: totalFee.value,
        maxPriorityFeePerGas: totalFee.value,
    }
}

async function estimateTxWithMinimumFee(provider: ethers.Provider, tx: ethers.TransactionRequest): Promise<ethers.TransactionRequest> {
    const block = await provider.getBlock('latest');
    const baseFeePerGas = ethers.FixedNumber.fromValue(block?.baseFeePerGas!, DECIMALS_WEI)
    const estimatedGasLimit = await provider.estimateGas({
        from: tx.from,
        to: tx.to,
        value: tx.value ?? '0x',
        data: tx.data ?? '0x'
    })
    const gasLimit = ethers.FixedNumber.fromValue(estimatedGasLimit, 0)
    const expectedFee = gasLimit.mul(baseFeePerGas)
    console.log('🪙  expected fee ~', ethers.formatEther(expectedFee.value), 'ISLM');

    return {
        ...tx,
        gasLimit: estimatedGasLimit,
        maxFeePerGas: baseFeePerGas.value,
        maxPriorityFeePerGas: baseFeePerGas.value,
    }
}

// legacy gasPrice variant
async function estimateTxWithLegacyNormalFee(provider: ethers.Provider, tx: ethers.TransactionRequest): Promise<ethers.TransactionRequest> {
    const feeData = await provider.getFeeData();
    const gasPrice = ethers.FixedNumber.fromValue(feeData.gasPrice!, DECIMALS_WEI);
    const estimatedGasLimit = await provider.estimateGas({
        from: tx.from,
        to: tx.to,
        value: tx.value ?? '0x',
        data: tx.data ?? '0x'
    })
    const gasLimit = ethers.FixedNumber.fromValue(estimatedGasLimit, 0)
    const expectedFee = gasLimit.mul(gasPrice)
    console.log('🪙  expected fee ~', ethers.formatEther(expectedFee.value), 'ISLM');

    return {
        ...tx,
        gasLimit: estimatedGasLimit,
        gasPrice: gasPrice.value,
    }
}

// with maxFeePerGas and maxPriorityFeePerGas
async function estimateTxWithNormalFee(provider: ethers.Provider, tx: ethers.TransactionRequest): Promise<ethers.TransactionRequest> {
    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

    const estimatedGasLimit = await provider.estimateGas({
        from: tx.from,
        to: tx.to,
        value: tx.value ?? '0x',
        data: tx.data ?? '0x'
    })

    const gasLimit = ethers.FixedNumber.fromValue(estimatedGasLimit, 0)
    const block = await provider.getBlock('latest')!;

    const effectiveGasPrice = getEffectiveGasPrice({
        baseFeePerGas: block?.baseFeePerGas!,
        maxFeePerGas: maxFeePerGas!,
        maxPriorityFeePerGas: maxPriorityFeePerGas!
    })

    const expectedFee = gasLimit.mul(effectiveGasPrice);
    console.log('🪙  expected fee ~', ethers.formatEther(expectedFee.value), 'ISLM');

    return {
        ...tx,
        gasLimit: estimatedGasLimit,
        maxFeePerGas: effectiveGasPrice.value,
        maxPriorityFeePerGas: effectiveGasPrice.value,
    }
}

async function estimateTxWithHightFee(provider: ethers.Provider, tx: ethers.TransactionRequest): Promise<ethers.TransactionRequest> {
    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

    const estimatedGasLimit = await provider.estimateGas({
        from: tx.from,
        to: tx.to,
        value: tx.value ?? '0x',
        data: tx.data ?? '0x'
    })

    const gasLimit = ethers.FixedNumber.fromValue(estimatedGasLimit, 0)
    const block = await provider.getBlock('latest')!;

    const effectiveGasPrice = getEffectiveGasPrice({
        baseFeePerGas: block?.baseFeePerGas!,
        maxFeePerGas: maxFeePerGas!,
        maxPriorityFeePerGas: maxPriorityFeePerGas!
    })

    const effectiveGasPriceX2 = effectiveGasPrice.add(effectiveGasPrice);

    const expectedFee = gasLimit.mul(effectiveGasPriceX2);
    console.log('🪙  expected fee ~', ethers.formatEther(expectedFee.value), 'ISLM');

    return {
        ...tx,
        gasLimit: estimatedGasLimit,
        maxFeePerGas: effectiveGasPriceX2.value,
        maxPriorityFeePerGas: effectiveGasPriceX2.value,
    }
}

export async function main() {
    const { provider, getExplorerTxUrl } = getRpcEthersProvider('TestEdge2');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const balance = await provider.getBalance(wallet.address);

    printSeparator('wallet')
    console.log('wallet:', wallet.address);
    console.log('balance:', ethers.formatUnits(balance), 'ISLM');

    printSeparator('transaction')

    const txRequest: ethers.TransactionRequest = {
        from: wallet.address,
        to: '0x682c67f2f01bc14eb64f280c2c51524f737b1acd',
        value: ethers.parseEther('0.001'),
        data: '0x',
    }

    const txResp = await wallet.sendTransaction(
        // await estimateTxWithStrictFee(provider, txRequest, ethers.parseEther('1')) // fee 1 ISLM
        // await estimateTxWithMinimumFee(provider, txRequest)
        // await estimateTxWithLegacyNormalFee(provider, txRequest)
        await estimateTxWithNormalFee(provider, txRequest)
        // await estimateTxWithHightFee(provider, txRequest)
    );

    console.log('🌐 explorer: ', getExplorerTxUrl(txResp.hash));
    // console.log('tx: ', JSON.stringify(txResp, null, 2));

    const block = await provider.getBlock(txResp.blockNumber!)!;
    const gasLimit = ethers.FixedNumber.fromValue(txResp.gasLimit);

    const effectiveGasPrice = getEffectiveGasPrice({
        baseFeePerGas: block?.baseFeePerGas!,
        maxFeePerGas: txResp.maxFeePerGas!,
        maxPriorityFeePerGas: txResp.maxPriorityFeePerGas!
    })

    const fee = gasLimit.mul(effectiveGasPrice)
    console.log('🔥 Burnt fees:', ethers.formatEther(fee.value), 'ISLM');
}
