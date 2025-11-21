import React from "react";
import ShoppingCartIcon from "../assets/shoppingcart.png";
import { X, CheckCircle, Lock } from "lucide-react";
import "./purchasepopup.css";

interface Price {
  sui: number;
  usd: number;
  paymenttype: string;
}

interface Creator {
  name: string;
}

interface ContentData {
  title: string;
  creator: Creator;
  price: Price;
}

interface PurchasePopupProps {
  content: ContentData | null;
  onClose: () => void;
}

const PurchasePopup: React.FC<PurchasePopupProps> = ({ content, onClose }) => {
  if (!content) return null;

  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [agreeIrreversible, setAgreeIrreversible] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showFailed, setShowFailed] = React.useState(false);

  const isAllowed = agreeTerms && agreeIrreversible;

  return (
    <div className="purchase-overlay">
      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="success-popup-container">
          <div className="success-popup">
            <button className="close-btn" onClick={onClose}>
              <X size={22} />
            </button>

            <div className="success-icon">
              <CheckCircle size={55} className="success-check" />
            </div>

            <h2 className="success-title">Purchase Successful</h2>
            <p className="success-sub">
              Your access token has been generated and secured on-chain.
            </p>

            <div className="success-box">
              <div className="success-row">
                <p>Access Token</p>
                <span>#34521</span>
              </div>

              <div className="success-row">
                <p>Policy ID</p>
                <span>seal_x9k4...m7j2</span>
              </div>

              <div className="success-row">
                <p>Content</p>
                <span>{content.title}</span>
              </div>

              <div className="success-row">
                <p>Creator</p>
                <span>{content.creator.name}</span>
              </div>

              <div className="success-row">
                <p>Bound To</p>
                <span>(your wallet address)</span>
              </div>

              <div className="success-row">
                <p>Status</p>
                <span className="active-status">Active</span>
              </div>

              <div className="success-row">
                <p>Created</p>
                <span>{new Date().toLocaleDateString()}</span>
              </div>

              <div className="token-rights">
                <h4>Your Token Grants You</h4>

                <p>
                  <CheckCircle size={16} className="checkcircle" /> Full streaming
                  access
                </p>
                <p>
                  <CheckCircle size={16} className="checkcircle" /> Non-transferable
                  token
                </p>
                <p>
                  <CheckCircle size={16} className="checkcircle" /> Linked
                  permanently to your wallet
                </p>
                <p>
                  <CheckCircle size={16} className="checkcircle" /> Secured on Sui
                  blockchain
                </p>
              </div>
            </div>

            <button className="close-success-btn" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* PURCHASE POPUP */}
      {!showSuccess && (
        <div className="purchase-popup">
          <button className="close-btn" onClick={onClose}>
            <X size={22} />
          </button>

          <img src={ShoppingCartIcon} />
          <h2 className="purchase-title">Confirm Your Purchase</h2>
          <p className="purchase-sub">
            Review your order before completing the transaction
          </p>

          <div className="purchase-box">
            <div className="purchase-content">
              <h4>{content.title}</h4>
              <p className="creator">By {content.creator.name}</p>
              <span className="access-tag">{content.price.paymenttype}</span>
            </div>

            <div className="purchase-price">
              <div className="row">
                <p>Content Price</p>
                <span>{content.price.sui} SUI</span>
              </div>

              <div className="row">
                <p>Platform Fee</p>
                <span>{content.price.sui} SUI</span>
              </div>

              <div className="total-row">
                <p>Total</p>
                <div>
                  <h3>{content.price.sui} SUI</h3>
                  <span>${content.price.usd}</span>
                </div>
              </div>
            </div>

            <div className="access-rights">
              <h4>Your Access Rights</h4>
              <p>
                <CheckCircle className="checkcircle" size={16} /> Lifetime streaming
                access
              </p>
              <p>
                <CheckCircle className="checkcircle" size={16} /> Bound to this
                wallet only
              </p>
              <p>
                <CheckCircle className="checkcircle" size={16} /> Non-transferable
                access pass
              </p>
              <p>
                <CheckCircle className="checkcircle" size={16} /> Secured on Sui
                blockchain
              </p>
            </div>

            <div className="checks">
              <label>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                I agree to the Terms of Service & Content Policy
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={agreeIrreversible}
                  onChange={(e) => setAgreeIrreversible(e.target.checked)}
                />
                I understand blockchain transactions are irreversible
              </label>
            </div>

            <button
              className="confirm-btn"
              disabled={!isAllowed}
              style={{
                opacity: isAllowed ? 1 : 0.4,
                cursor: isAllowed ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                setShowFailed(true);
                setShowSuccess(false);
              }}
            >
              Confirm Purchase
            </button>

            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <div className="secure-footer">
              <Lock size={18} />
              <p>Your transaction is secured by Sui blockchain.</p>
            </div>
          </div>
        </div>
      )}

      {/* FAILED POPUP */}
      {showFailed && (
        <div className="failed-popup-container">
          <div className="failed-popup">
            <button className="close-btn" onClick={onClose}>
              <X size={22} />
            </button>

            <div className="failed-icon">
              <X size={55} className="failed-x" />
            </div>

            <h2 className="failed-title">Purchase Failed</h2>
            <p className="failed-sub">
              Something went wrong with your transaction.
            </p>

            <div className="failed-box">
              <div className="failed-row">
                <p>Error Type</p>
                <span>Transaction Rejected</span>
              </div>

              <div className="failed-row">
                <p>Transaction ID</p>
                <span>txn_98k2...f11p</span>
              </div>

              <div className="failed-row">
                <p>Reason</p>
                <span>Network error — transaction not processed</span>
              </div>

              <div className="failed-row">
                <p>Status</p>
                <span className="failed-status">Failed</span>
              </div>

              <div className="failed-row">
                <p>Time</p>
                <span>{new Date().toLocaleString()}</span>
              </div>

              <div className="retry-box">
                <h4>You can try again</h4>
                <p>Please ensure your wallet is connected and funded.</p>
              </div>
            </div>

            <button className="retry-btn">Retry Purchase</button>
            <button className="close-failed-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasePopup;
