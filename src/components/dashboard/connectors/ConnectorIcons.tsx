import React from 'react';
import { ConnectorProviderId } from '../../../lib/connectors/types';
import {
  MessageSquare,
  ShoppingBag,
  CreditCard,
  FileSpreadsheet,
  DollarSign,
  Calculator,
  Table,
  Hash,
  Instagram,
  Share2,
} from 'lucide-react';

export const ConnectorIcon: React.FC<{ provider: ConnectorProviderId; className?: string }> = ({
  provider,
  className = 'w-5 h-5',
}) => {
  switch (provider) {
    case 'whatsapp':
      return <MessageSquare className={`${className} text-[#25D366]`} />;
    case 'shopify':
      return <ShoppingBag className={`${className} text-[#96BF48]`} />;
    case 'stripe':
      return <CreditCard className={`${className} text-[#635BFF]`} />;
    case 'google':
      return <FileSpreadsheet className={`${className} text-[#4285F4]`} />;
    case 'paypal':
      return <DollarSign className={`${className} text-[#0070BA]`} />;
    case 'quickbooks':
      return <Calculator className={`${className} text-[#2CA01C]`} />;
    case 'airtable':
      return <Table className={`${className} text-[#FCB400]`} />;
    case 'slack':
      return <Hash className={`${className} text-[#E01E5A]`} />;
    case 'instagram':
      return <Instagram className={`${className} text-[#E4405F]`} />;
    case 'x':
      return <Share2 className={`${className} text-slate-900 dark:text-white`} />;
    default:
      return <Share2 className={className} />;
  }
};
