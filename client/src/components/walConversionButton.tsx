import { useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { Button, Tooltip } from "@radix-ui/themes";
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useGetWalTokens } from "../hooks/useGetWalTokens";
import { useWalBalance } from "../hooks/useWalBalance";
import { useSuiBalance } from '../hooks/useSuiBalance';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';

export function WalConversionButton() {
    const account = useCurrentAccount();
    const { data: walBalance } = useWalBalance();
    const { data: suiBalance } = useSuiBalance();
    const { mutateAsync: convertToWal, isPending } = useGetWalTokens();
    const [toast, setToast] = useState<{ open: boolean; message: string; isError: boolean }>({
        open: false,
        message: '',
        isError: false
    });

    const handleConvert = async () => {
        try {
            await convertToWal();
            setToast({
                open: true,
                message: 'Successfully converted SUI to WAL!',
                isError: false
            });
        } catch (error) {
            console.error('Conversion failed:', error);
            setToast({
                open: true,
                message: error instanceof Error ? error.message : 'Failed to convert SUI to WAL',
                isError: true
            });
        }
    };

    const formatBalance = (balance: string | number | undefined) => {
        if (!balance) return '0.00';
        const num = typeof balance === 'string' ? parseFloat(balance) : balance;
        return num.toFixed(2);
    };

    if (!account) return null;

    return (
        <Toast.Provider>
            <div className="flex items-center gap-4" style={{
                background: 'var(--gray-3)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--gray-6)',
                height: '40px',
                boxSizing: 'border-box'
            }}>
                <Button 
                    onClick={handleConvert} 
                    loading={isPending}
                    disabled={!suiBalance || parseFloat(suiBalance) <= 0}
                    variant="soft"
                    size="1"
                    className="!px-3 !py-1 !text-sm"
                >
                    Convert SUI to WAL
                </Button>
                
                <div className="h-5 w-px bg-gray-300"></div>
                
                <Tooltip content={`SUI Balance: ${formatBalance(suiBalance)} | WAL Balance: ${formatBalance(walBalance)}`}>
                    <div className="flex items-center gap-2" style={{ minWidth: '100px' }}>
                        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--gray-12)' }}>
                            <span>WAL:</span>
                            <span className="font-mono">{formatBalance(walBalance)}</span>
                        </div>
                    </div>
                </Tooltip>
            </div>

            <Toast.Root
                className="bg-white rounded-md shadow-lg p-4 flex items-center gap-3 data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=end]:animate-swipeOut"
                open={toast.open}
                onOpenChange={(open) => setToast(prev => ({ ...prev, open }))}
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    border: '1px solid #e2e8f0',
                    minWidth: '300px'
                }}
            >
                <div className={`flex-shrink-0 ${toast.isError ? 'text-red-500' : 'text-green-500'}`}>
                    {toast.isError ? <CrossCircledIcon width={24} height={24} /> : <CheckCircledIcon width={24} height={24} />}
                </div>
                <div className="flex-1">
                    <Toast.Title className="font-medium text-gray-900">
                        {toast.isError ? 'Error' : 'Success'}
                    </Toast.Title>
                    <Toast.Description className="text-sm text-gray-600">
                        {toast.message}
                    </Toast.Description>
                </div>
                <Toast.Close className="ml-4 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Close</span>
                    <div className="h-5 w-5 flex items-center justify-center">×</div>
                </Toast.Close>
            </Toast.Root>
            <Toast.Viewport />
        </Toast.Provider >
    );
}