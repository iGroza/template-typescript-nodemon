import { ethers } from "ethers";

export type GetEffectiveGasPriceParams = {
    baseFeePerGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}

export const DECIMALS_WEI = 18;

// calculated by https://eips.ethereum.org/EIPS/eip-1559
export function getEffectiveGasPrice(params: GetEffectiveGasPriceParams) {
    const baseFeePerGas = ethers.FixedNumber.fromValue(params.baseFeePerGas!, DECIMALS_WEI);
    const maxFeePerGas = ethers.FixedNumber.fromValue(params.maxFeePerGas!, DECIMALS_WEI);
    const maxPriorityFeePerGas = ethers.FixedNumber.fromValue(params.maxPriorityFeePerGas!, DECIMALS_WEI);

    let priorityFeePerGas: ethers.FixedNumber;
    if (maxPriorityFeePerGas.lte(maxFeePerGas.sub(baseFeePerGas))) {
        priorityFeePerGas = maxPriorityFeePerGas;
    } else {
        priorityFeePerGas = maxFeePerGas.sub(baseFeePerGas);
    }

    return priorityFeePerGas.add(baseFeePerGas)
}