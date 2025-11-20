import {
    useAccounts,
    useResolveSuiNSName,
    useSwitchAccount,
} from "@mysten/dapp-kit";
import {
    ConnectModal,
    useCurrentAccount,
    useDisconnectWallet,
} from "@mysten/dapp-kit";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useState, useEffect } from "react";


const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="9" width="10" height="10" rx="2" stroke="#97F0E5" strokeWidth="2" />
        <rect x="5" y="5" width="10" height="10" rx="2" stroke="#97F0E5" strokeWidth="2" opacity="0.5" />
    </svg>
);

const ExplorerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M14 3h7v7" stroke="#97F0E5" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 3L9 15" stroke="#97F0E5" strokeWidth="2" strokeLinecap="round" />
        <rect x="3" y="9" width="12" height="12" rx="2" stroke="#97F0E5" strokeWidth="2" />
    </svg>
);

const DisconnectIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18" stroke="#E594A7" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#E594A7" strokeWidth="2" />
        <path d="M10 11v5" stroke="#E594A7" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 11v5" stroke="#E594A7" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// simple default profile icon
const ProfileIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="#97F0E5" strokeWidth="2" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#97F0E5" strokeWidth="2" />
    </svg>
);


export default function ConnectWalletButton({
    fullWidth = false,
}: {
    fullWidth?: boolean;
}) {
    const account = useCurrentAccount();
    const accounts = useAccounts();
    const { data: suiNSName } = useResolveSuiNSName(account?.address);
    const { mutate: disconnect } = useDisconnectWallet();
    const { mutate: switchAccount } = useSwitchAccount();
    const [open, setOpen] = useState(false);
    const [alignment, setAlignment] = useState<"center" | "end">("center");

    useEffect(() => {
        const handleResize = () => {
            setAlignment(window.innerWidth >= 640 ? "end" : "center");
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleAccountSwitch = (
        acc: NonNullable<typeof accounts>[number]
    ) => switchAccount({ account: acc });

    const handleDisconnectAll = () => {
        disconnect();
        if (window.location.pathname === "/link") {
            window.location.href = "/connect";
        }
    };

    return (
        <>
            {account ? (
                <div className={`space-y-4 ${fullWidth ? "w-full" : ""}`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`bg-[#97F0E54D] text-[#F7F7F7] px-4 py-2 rounded-md hover:bg-[#97F0E54D] hover:opacity-80 flex flex-row items-center gap-2 ${fullWidth ? "w-full" : ""}`}
                            >
                                <ProfileIcon />
                                <span className="text-[#FFF] text-sm uppercase font-montreal">
                                    {suiNSName
                                        ? `@${suiNSName.split(".sui")[0]}`
                                        : `@${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                                    }
                                </span>
                                <ChevronDown />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align={alignment}
                            className="border-2 border-[#97F0E5] rounded-2xl p-3 bg-[#0C0F1D] flex flex-col gap-2 min-w-[300px]"
                        >
                            {/* Header */}
                            <div className="w-full flex flex-row gap-3">
                                <ProfileIcon />
                                <div className="flex flex-col">
                                    <span className="text-[#FFF] uppercase font-montreal">
                                        {suiNSName
                                            ? `@${suiNSName.split(".sui")[0]}`
                                            : `@${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                                        }
                                    </span>
                                    {suiNSName && (
                                        <span className="text-[#FFF] opacity-70 text-sm font-montreal">
                                            {account.address.slice(0, 6)}...{account.address.slice(-4)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Multiple accounts */}
                            {accounts && accounts.length > 1 && (
                                <div className="flex flex-col gap-1 py-2 border-t border-[#97F0E5]/20">
                                    {accounts.map((acc) => (
                                        <button
                                            key={acc.address}
                                            onClick={() => handleAccountSwitch(acc)}
                                            className={`w-full flex flex-row gap-2 p-2 rounded-md hover:bg-[#97F0E514] transition-colors ${acc.address === account.address ? "bg-[#97F0E514]" : ""
                                                }`}
                                        >
                                            <ProfileIcon />
                                            <div className="flex flex-col">
                                                <span className="text-[#FFF] text-sm uppercase font-montreal">
                                                    {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                                                </span>
                                                <span className="text-[#FFF] opacity-50 text-xs font-montreal">
                                                    {acc.address.slice(0, 10)}...{acc.address.slice(-6)}
                                                </span>
                                            </div>

                                            {acc.address === account.address && (
                                                <div className="ml-auto flex items-center">
                                                    <div className="w-2 h-2 bg-[#97F0E5] rounded-full"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-row justify-between gap-1 pt-2">
                                <button
                                    className="h-fit w-[92px] py-2 bg-[#97F0E514] text-[#FFF] rounded-md flex flex-col items-center gap-1 hover:opacity-80"
                                    onClick={() => navigator.clipboard.writeText(account.address)}
                                >
                                    <CopyIcon />
                                    <span className="text-xs font-montreal">Copy</span>
                                </button>

                                <a
                                    href={`https://suiscan.xyz/address/${account.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button className="h-fit w-[92px] py-2 bg-[#97F0E514] text-[#FFF] rounded-md flex flex-col items-center gap-1 hover:opacity-80">
                                        <ExplorerIcon />
                                        <span className="text-xs font-montreal">Explorer</span>
                                    </button>
                                </a>

                                <button
                                    className="h-fit w-[92px] py-2 bg-[#E594A714] text-[#FFF] rounded-md flex flex-col items-center gap-1 hover:opacity-80"
                                    onClick={handleDisconnectAll}
                                >
                                    <DisconnectIcon />
                                    <span className="text-xs font-montreal">Disconnect</span>
                                </button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <ConnectModal
                    trigger={
                        <button className={`connect-btn ${fullWidth ? "w-full" : ""}`}>
                            Connect Wallet
                        </button>
                    }
                    open={open}
                    onOpenChange={setOpen}
                />
            )}
        </>
    );
}
