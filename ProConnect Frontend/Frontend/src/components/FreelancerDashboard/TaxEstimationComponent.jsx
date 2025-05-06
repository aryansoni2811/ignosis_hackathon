// TaxEstimationComponent.jsx
import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Calendar, 
  AlertCircle, 
  Calculator, 
  Info, 
  DollarSign, 
  RefreshCw, 
  PieChart,
  Globe,
  TrendingUp
} from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import './TaxEstimationComponent.css';

const TaxEstimationComponent = ({ freelancerId }) => {
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [customEarnings, setCustomEarnings] = useState('');
  const [joinDate, setJoinDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [projectionMode, setProjectionMode] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState(null);

  const countryOptions = [
    { value: 'US', label: 'United States', currency: 'USD', symbol: '$' },
    { value: 'UK', label: 'United Kingdom', currency: 'GBP', symbol: '£' },
    { value: 'CA', label: 'Canada', currency: 'CAD', symbol: '$' },
    { value: 'IN', label: 'India', currency: 'INR', symbol: '₹' },
    { value: 'AU', label: 'Australia', currency: 'AUD', symbol: '$' },
    { value: 'DE', label: 'Germany', currency: 'EUR', symbol: '€' }
  ];

  // Fallback exchange rates if API fails
  const fallbackExchangeRates = {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    CAD: 1.36,
    INR: 83.12,
    AUD: 1.51
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0 || exchangeRateError) {
      fetchTaxData();
    }
  }, [freelancerId, selectedCountry, joinDate, customEarnings, projectionMode, exchangeRates]);

  const fetchExchangeRates = async () => {
    setExchangeRateLoading(true);
    setExchangeRateError(null);
    try {
      // Using a free API (you might want to use your own backend in production)
      const response = await axiosInstance.get(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setExchangeRateError('Failed to fetch latest exchange rates. Using fallback rates.');
      setExchangeRates(fallbackExchangeRates);
    } finally {
      setExchangeRateLoading(false);
    }
  };

  const fetchTaxData = async () => {
    setLoading(true);
    try {
      const currentCountry = countryOptions.find(c => c.value === selectedCountry);
      const earningsInUSD = customEarnings ? parseFloat(customEarnings) : 11500;
      const exchangeRate = exchangeRates[currentCountry.currency] || 1;
      const convertedAmount = earningsInUSD * exchangeRate;
      
      const response = await axiosInstance.get(
        `/api/freelancer/finance/tax-estimation/${freelancerId}?country=${selectedCountry}&joinDate=${joinDate}&earnings=${convertedAmount}&projection=${projectionMode}`
      );
      
      setTaxData({
        ...response.data,
        currency: currentCountry.currency,
        currencySymbol: currentCountry.symbol,
        exchangeRate,
        originalEarningsUSD: earningsInUSD
      });
    } catch (error) {
      console.error('Error fetching tax estimation:', error);
      calculateClientSideEstimation();
    } finally {
      setLoading(false);
    }
  };

  const calculateClientSideEstimation = () => {
    const currentCountry = countryOptions.find(c => c.value === selectedCountry);
    const earningsInUSD = customEarnings ? parseFloat(customEarnings) : 11500;
    const exchangeRate = exchangeRates[currentCountry.currency] || 1;
    const convertedAmount = earningsInUSD * exchangeRate;
    
    // Calculate months since joining
    const join = new Date(joinDate);
    const today = new Date();
    const monthsActive = 
      (today.getFullYear() - join.getFullYear()) * 12 + 
      (today.getMonth() - join.getMonth()) + 
      (today.getDate() >= join.getDate() ? 0 : -1);
    
    const monthsInYear = 12;
    const monthsFactor = Math.max(monthsActive, 1) / monthsInYear;
    
    // Project annual earnings
    const projectedAnnualEarnings = projectionMode ? 
      Math.round(convertedAmount / monthsFactor) : 
      convertedAmount;

    // Calculate tax based on selected country
    const result = calculateTaxByCountry(selectedCountry, projectedAnnualEarnings);
    
    // Prorate tax if needed
    const currentTaxLiability = projectionMode ? 
      result.estimatedTax * monthsFactor : 
      result.estimatedTax;
    
    setTaxData({
      ...result,
      earnings: projectedAnnualEarnings,
      currentEarnings: convertedAmount,
      monthsActive,
      currentTaxLiability: Math.round(currentTaxLiability * 100) / 100,
      projectedAnnual: projectionMode,
      currency: currentCountry.currency,
      currencySymbol: currentCountry.symbol,
      exchangeRate,
      originalEarningsUSD: earningsInUSD
    });
  };

  const calculateTaxByCountry = (country, income) => {
    let incomeTax = 0;
    let selfEmploymentTax = 0;
    let taxRate = 0;
    
    switch (country) {
      case 'US':
        // Progressive tax brackets (2023 rates)
        if (income <= 10275) {
          incomeTax = income * 0.10;
        } else if (income <= 41775) {
          incomeTax = 10275 * 0.10 + (income - 10275) * 0.12;
        } else if (income <= 89075) {
          incomeTax = 10275 * 0.10 + (41775 - 10275) * 0.12 + (income - 41775) * 0.22;
        } else if (income <= 170050) {
          incomeTax = 10275 * 0.10 + (41775 - 10275) * 0.12 + (89075 - 41775) * 0.22 + (income - 89075) * 0.24;
        } else if (income <= 215950) {
          incomeTax = 10275 * 0.10 + (41775 - 10275) * 0.12 + (89075 - 41775) * 0.22 + 
                    (170050 - 89075) * 0.24 + (income - 170050) * 0.32;
        } else {
          incomeTax = 10275 * 0.10 + (41775 - 10275) * 0.12 + (89075 - 41775) * 0.22 + 
                    (170050 - 89075) * 0.24 + (215950 - 170050) * 0.32 + (income - 215950) * 0.35;
        }
        
        // Self-employment tax (15.3% of 92.35% of net earnings)
        selfEmploymentTax = income * 0.9235 * 0.153;
        break;
        
      case 'UK':
        // UK tax brackets with personal allowance (2023/24 rates)
        const personalAllowance = income > 100000 ? Math.max(0, 12570 - (income - 100000) / 2) : 12570;
        const taxableIncome = Math.max(0, income - personalAllowance);
        
        if (taxableIncome <= 37700) {
          incomeTax = taxableIncome * 0.20;
        } else if (taxableIncome <= 150000) {
          incomeTax = 37700 * 0.20 + (taxableIncome - 37700) * 0.40;
        } else {
          incomeTax = 37700 * 0.20 + (150000 - 37700) * 0.40 + (taxableIncome - 150000) * 0.45;
        }
        
        // National Insurance contributions (simplified)
        if (income > 9568) {
          selfEmploymentTax = (Math.min(income, 50270) - 9568) * 0.092 + 
                            (income > 50270 ? (income - 50270) * 0.032 : 0);
        }
        break;
        
      case 'CA':
        // Canadian federal tax brackets (2023 rates)
        if (income <= 50197) {
          incomeTax = income * 0.15;
        } else if (income <= 100392) {
          incomeTax = 50197 * 0.15 + (income - 50197) * 0.205;
        } else if (income <= 155625) {
          incomeTax = 50197 * 0.15 + (100392 - 50197) * 0.205 + (income - 100392) * 0.26;
        } else if (income <= 221708) {
          incomeTax = 50197 * 0.15 + (100392 - 50197) * 0.205 + (155625 - 100392) * 0.26 +
                    (income - 155625) * 0.29;
        } else {
          incomeTax = 50197 * 0.15 + (100392 - 50197) * 0.205 + (155625 - 100392) * 0.26 +
                    (221708 - 155625) * 0.29 + (income - 221708) * 0.33;
        }
        
        // CPP + EI (simplified)
        selfEmploymentTax = Math.min(income, 61400) * 0.111;
        break;
        
      case 'IN':
        // Indian tax brackets (2023-24 rates)
        if (income <= 250000) {
          incomeTax = 0;
        } else if (income <= 500000) {
          incomeTax = (income - 250000) * 0.05;
        } else if (income <= 1000000) {
          incomeTax = (500000 - 250000) * 0.05 + (income - 500000) * 0.20;
        } else {
          incomeTax = (500000 - 250000) * 0.05 + (1000000 - 500000) * 0.20 + (income - 1000000) * 0.30;
        }
        
        // Health and education cess
        incomeTax *= 1.04;
        break;
        
      case 'AU':
        // Australian tax brackets (2022-23 rates)
        if (income <= 18200) {
          incomeTax = 0;
        } else if (income <= 45000) {
          incomeTax = (income - 18200) * 0.19;
        } else if (income <= 120000) {
          incomeTax = 5092 + (income - 45000) * 0.325;
        } else if (income <= 180000) {
          incomeTax = 29467 + (income - 120000) * 0.37;
        } else {
          incomeTax = 51667 + (income - 180000) * 0.45;
        }
        
        // Medicare Levy (2%)
        selfEmploymentTax = income * 0.02;
        break;
        
      case 'DE':
        // German tax brackets (simplified)
        if (income <= 9744) {
          incomeTax = 0;
        } else if (income <= 14753) {
          incomeTax = (income - 9744) * 0.14;
        } else if (income <= 57918) {
          incomeTax = (14753 - 9744) * 0.14 + (income - 14753) * 0.42;
        } else {
          incomeTax = (14753 - 9744) * 0.14 + (57918 - 14753) * 0.42 + (income - 57918) * 0.45;
        }
        
        // Solidarity surcharge (5.5% of income tax)
        incomeTax *= 1.055;
        break;
        
      default:
        // Default flat tax for other countries
        incomeTax = income * 0.25;
    }
    
    const totalTax = incomeTax + selfEmploymentTax;
    taxRate = income > 0 ? (totalTax / income) * 100 : 0;
    
    return {
      estimatedTax: Math.round(totalTax * 100) / 100,
      incomeTax: Math.round(incomeTax * 100) / 100,
      selfEmploymentTax: Math.round(selfEmploymentTax * 100) / 100,
      taxRate: Math.round(taxRate * 10) / 10,
      taxYear: new Date().getFullYear(),
      country
    };
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleEarningsChange = (e) => {
    setCustomEarnings(e.target.value);
  };

  const handleJoinDateChange = (e) => {
    setJoinDate(e.target.value);
  };

  const toggleProjectionMode = () => {
    setProjectionMode(!projectionMode);
  };

  const handleRecalculate = () => {
    fetchTaxData();
  };

  const handleRefreshRates = () => {
    fetchExchangeRates();
  };

  const formatCurrency = (amount, currency = taxData?.currency, symbol = taxData?.currencySymbol) => {
    if (!amount) return '-';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount).replace(/^[A-Z]{3}/, symbol || '$');
    } catch {
      return `${symbol || '$'}${amount.toFixed(2)}`;
    }
  };

  if (loading) {
    return (
      <div className="tax-estimation-card loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Calculating tax estimation...</p>
      </div>
    );
  }

  if (!taxData) {
    return (
      <div className="tax-estimation-card error">
        <AlertCircle className="error-icon" size={24} />
        <p>Unable to generate tax estimation</p>
      </div>
    );
  }

  const monthlyPayment = taxData.currentTaxLiability / Math.min(taxData.monthsActive, 12);
  const quarterlyPayment = taxData.currentTaxLiability / 4;
  const currentCountry = countryOptions.find(c => c.value === selectedCountry);

  return (
    <div className="tax-estimation-card">
      <div className="tax-header">
        <div className="tax-title">
          <Calculator size={20} className="header-icon" />
          <h3>Tax Estimation</h3>
        </div>
        <button 
          className="info-button"
          onClick={() => setInfoVisible(!infoVisible)}
          aria-label="Tax information"
        >
          <Info size={18} />
        </button>
      </div>
      
      {infoVisible && (
        <div className="tax-info-box">
          <p>Tax rates are based on current {taxData.country} tax brackets for self-employed professionals.</p>
          <p>For accurate tax advice, please consult a tax professional.</p>
          {exchangeRateError && (
            <p className="exchange-rate-error">{exchangeRateError}</p>
          )}
        </div>
      )}
      
      <div className="tax-controls">
        <div className="control-group">
          <label htmlFor="country-select" className="control-label">
            <Globe size={16} className="label-icon" />
            Country
          </label>
          <select 
            id="country-select"
            value={selectedCountry}
            onChange={handleCountryChange}
            className="country-select"
          >
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.currency})
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="earnings-input" className="control-label">
            <DollarSign size={16} className="label-icon" />
            Current Earnings (USD)
          </label>
          <input
            id="earnings-input"
            type="number"
            value={customEarnings || taxData.originalEarningsUSD}
            onChange={handleEarningsChange}
            placeholder="Enter current earnings in USD"
            className="earnings-input"
          />
          <div className="converted-amount">
            ≈ {formatCurrency(taxData.currentEarnings)} {selectedCountry !== 'US' && (
              <span className="exchange-rate">
                (1 USD = {taxData.exchangeRate.toFixed(4)} {currentCountry.currency})
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="tax-controls">
        <div className="control-group">
          <label htmlFor="join-date" className="control-label">
            <Calendar size={16} className="label-icon" />
            Join Date
          </label>
          <input
            id="join-date"
            type="date"
            value={joinDate}
            onChange={handleJoinDateChange}
            className="date-input"
          />
        </div>
        
        <div className="control-group">
          <label className="control-label">
            <TrendingUp size={16} className="label-icon" />
            Calculation Mode
          </label>
          <div className="mode-toggle">
            <button
              onClick={toggleProjectionMode}
              className={`mode-button ${projectionMode ? 'active' : ''}`}
            >
              Projected Annual
            </button>
            <button
              onClick={toggleProjectionMode}
              className={`mode-button ${!projectionMode ? 'active' : ''}`}
            >
              Actual Earnings
            </button>
          </div>
        </div>
      </div>
      
      <div className="tax-summary">
        <div className="summary-row">
          <div className="summary-item">
            <span className="summary-label">
              {projectionMode ? 'Projected Annual' : 'Actual'} Earnings
            </span>
            <div className="summary-value">{formatCurrency(taxData.earnings)}</div>
            {projectionMode && (
              <div className="summary-note">
                Based on {taxData.monthsActive} month{taxData.monthsActive !== 1 ? 's' : ''} of activity
              </div>
            )}
          </div>
          <div className="summary-item highlight">
            <span className="summary-label">
              {projectionMode ? 'Current' : 'Total'} Tax Liability
            </span>
            <div className="summary-value highlight">
              {formatCurrency(taxData.currentTaxLiability)}
            </div>
          </div>
        </div>
        
        <div className="summary-row">
          <div className="summary-item">
            <span className="summary-label">
              {projectionMode ? 'Projected Annual' : 'Total'} Tax
            </span>
            <div className="summary-value secondary">
              {formatCurrency(taxData.estimatedTax)}
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-label">Effective Tax Rate</span>
            <div className="summary-value secondary">{taxData.taxRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>
      
      <div className="tax-breakdown">
        <div className="breakdown-header">
          <PieChart size={16} className="breakdown-icon" />
          <h4>Tax Breakdown</h4>
        </div>
        
        <div className="breakdown-items">
          <div className="breakdown-item">
            <span>Income Tax:</span>
            <span>{formatCurrency(projectionMode ? taxData.incomeTax * (taxData.monthsActive / 12) : taxData.incomeTax)}</span>
          </div>
          
          {taxData.selfEmploymentTax > 0 && (
            <div className="breakdown-item">
              <span>Self-Employment Tax:</span>
              <span>{formatCurrency(projectionMode ? taxData.selfEmploymentTax * (taxData.monthsActive / 12) : taxData.selfEmploymentTax)}</span>
            </div>
          )}
          
          <div className="breakdown-item total">
            <span>Total:</span>
            <span>{formatCurrency(taxData.currentTaxLiability)}</span>
          </div>
        </div>
      </div>
      
      <div className="payment-planning">
        <h4 className="planning-header">Payment Planning</h4>
        <div className="payment-options">
          <div className="payment-option">
            <div className="option-header">
              <span>Monthly</span>
              <span className="option-amount">{formatCurrency(monthlyPayment)}</span>
            </div>
            <div className="option-desc">12 payments per year</div>
          </div>
          
          <div className="payment-option recommended">
            <div className="option-header">
              <span>Quarterly</span>
              <span className="option-amount">{formatCurrency(quarterlyPayment)}</span>
            </div>
            <div className="option-desc">4 payments per year (recommended)</div>
          </div>
        </div>
      </div>
      
      <div className="tax-disclaimer">
        <AlertCircle size={14} className="disclaimer-icon" />
        <span>
          This is an estimate for {taxData.country} tax system based on {taxData.monthsActive} month{taxData.monthsActive !== 1 ? 's' : ''} of activity. 
          {exchangeRateError && ' ' + exchangeRateError} Consult a tax professional for advice.
        </span>
      </div>
      
      <div className="action-buttons">
        <button 
          className="recalculate-button"
          onClick={handleRecalculate}
        >
          <RefreshCw size={14} className="button-icon" />
          Recalculate Taxes
        </button>
        
        {selectedCountry !== 'US' && (
          <button 
            className="refresh-rates-button"
            onClick={handleRefreshRates}
            disabled={exchangeRateLoading}
          >
            <RefreshCw size={14} className="button-icon" />
            {exchangeRateLoading ? 'Updating Rates...' : 'Refresh Exchange Rates'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaxEstimationComponent;