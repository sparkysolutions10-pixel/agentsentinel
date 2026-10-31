/**
 * OperationTypeClassifier - Stellar operation classification and risk assessment.
 */

export type OperationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ClassifiedOperation {
  type: string;
  category: 'payment' | 'account' | 'trustline' | 'dex' | 'liquidity_pool' | 'soroban' | 'governance';
  riskLevel: OperationRiskLevel;
  description: string;
}

export class OperationTypeClassifier {
  private static readonly CLASSIFICATIONS: Record<string, Omit<ClassifiedOperation, 'type'>> = {
    payment: {
      category: 'payment',
      riskLevel: 'LOW',
      description: 'Transfer of assets to destination account'
    },
    pathPaymentStrictReceive: {
      category: 'payment',
      riskLevel: 'MEDIUM',
      description: 'Path payment ensuring destination receives exact amount'
    },
    pathPaymentStrictSend: {
      category: 'payment',
      riskLevel: 'MEDIUM',
      description: 'Path payment ensuring sender sends exact amount'
    },
    createAccount: {
      category: 'account',
      riskLevel: 'MEDIUM',
      description: 'Creates and funds a new account with XLM'
    },
    accountMerge: {
      category: 'account',
      riskLevel: 'CRITICAL',
      description: 'Transfers all XLM balance and deletes the source account'
    },
    setOptions: {
      category: 'governance',
      riskLevel: 'HIGH',
      description: 'Modifies account signers, master weight, thresholds, or flags'
    },
    changeTrust: {
      category: 'trustline',
      riskLevel: 'LOW',
      description: 'Establishes or modifies trustline to asset issuer'
    },
    manageData: {
      category: 'account',
      riskLevel: 'MEDIUM',
      description: 'Stores or removes arbitrary binary key/value metadata'
    },
    manageBuyOffer: {
      category: 'dex',
      riskLevel: 'LOW',
      description: 'Places or cancels buy offer on Stellar decentralized exchange'
    },
    manageSellOffer: {
      category: 'dex',
      riskLevel: 'LOW',
      description: 'Places or cancels sell offer on Stellar decentralized exchange'
    },
    invokeHostFunction: {
      category: 'soroban',
      riskLevel: 'HIGH',
      description: 'Executes a Soroban smart contract invocation'
    }
  };

  public static classify(operationType: string): ClassifiedOperation {
    const meta = this.CLASSIFICATIONS[operationType];
    if (meta) {
      return { type: operationType, ...meta };
    }
    return {
      type: operationType,
      category: 'account',
      riskLevel: 'MEDIUM',
      description: 'Unknown or unclassified Stellar operation'
    };
  }

  public static isHighRisk(operationType: string): boolean {
    const op = this.classify(operationType);
    return op.riskLevel === 'HIGH' || op.riskLevel === 'CRITICAL';
  }
}
