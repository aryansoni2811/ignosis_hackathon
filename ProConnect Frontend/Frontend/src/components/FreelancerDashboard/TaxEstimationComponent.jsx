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
  TrendingUp,
  Loader
} from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import './TaxEstimationComponent.css';

const TaxEstimationComponent = ({ freelancerId }) => {
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [customEarnings, setCustomEarnings] = useState('');
  const [joinDate, setJoinDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [projectionMode, setProjectionMode] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeRateLoading, setExchangeRateLoading] = useState(true);
  const [exchangeRateError, setExchangeRateError] = useState(null);
  const [freelancerEarnings, setFreelancerEarnings] = useState(0);

  // Enhanced country data with tax system info
  const countryOptions = [
    { 
      value: 'US', 
      label: 'United States', 
      currency: 'USD', 
      symbol: '$',
      taxSystem: 'Progressive (Federal + State + Self-Employment)'
    },
    { 
      value: 'UK', 
      label: 'United Kingdom', 
      currency: 'GBP', 
      symbol: '£',
      taxSystem: 'Progressive (Income Tax + National Insurance)'
    },
    { 
      value: 'CA', 
      label: 'Canada', 
      currency: 'CAD', 
      symbol: '$',
      taxSystem: 'Progressive (Federal + Provincial)'
    },
    { 
      value: 'IN', 
      label: 'India', 
      currency: 'INR', 
      symbol: '₹',
      taxSystem: 'Progressive with Slabs'
    },
    { 
      value: 'AU', 
      label: 'Australia', 
      currency: 'AUD', 
      symbol: '$',
      taxSystem: 'Progressive with Medicare Levy'
    },
    { 
      value: 'DE', 
      label: 'Germany', 
      currency: 'EUR', 
      symbol: '€',
      taxSystem: 'Progressive with Solidarity Surcharge'
    }
  ];

  // Fallback exchange rates if API fails (updated rates)
  const fallbackExchangeRates = {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    CAD: 1.36,
    INR: 83.30,
    AUD: 1.50
  };

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Get freelancer email from localStorage or session
        const freelancerEmail = localStorage.getItem('freelancerEmail') || sessionStorage.getItem('freelancerEmail');
        
        if (!freelancerEmail) {
          throw new Error('Freelancer email not found');
        }

        // Fetch freelancer earnings
        const earningsResponse = await axiosInstance.get(`/api/freelancers/${freelancerEmail}/earnings`);
        const earnings = earningsResponse.data.totalEarnings || 0;
        setFreelancerEarnings(earnings);
        setCustomEarnings(earnings.toString()); // Auto-populate earnings field
        
        // Fetch exchange rates
        await fetchExchangeRates();
        
        // Now that we have initial data, we can calculate tax
        await fetchTaxData();
      } catch (error) {
        console.error('Error initializing tax estimation:', error);
        // Even if there's an error, we'll show the component with default values
        await fetchExchangeRates(true); // Force fallback rates
        await fetchTaxData();
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [freelancerId]);

  useEffect(() => {
    if (taxData) { // Only run when taxData exists (after initial load)
      fetchTaxData();
    }
  }, [selectedCountry, joinDate, customEarnings, projectionMode, exchangeRates]);

  const fetchExchangeRates = async (useFallback = false) => {
    setExchangeRateLoading(true);
    setExchangeRateError(null);
    
    try {
      if (useFallback) {
        throw new Error('Forcing fallback rates');
      }
      
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
    try {
      const currentCountry = countryOptions.find(c => c.value === selectedCountry);
      const earningsInUSD = customEarnings ? parseFloat(customEarnings) : freelancerEarnings;
      const exchangeRate = exchangeRates[currentCountry.currency] || 1;
      const convertedAmount = earningsInUSD * exchangeRate;
      
      // Calculate months since joining
      const join = new Date(joinDate);
      const today = new Date();
      const monthsActive = Math.max(
        (today.getFullYear() - join.getFullYear()) * 12 + 
        (today.getMonth() - join.getMonth()) + 
        (today.getDate() >= join.getDate() ? 0 : -1),
        1
      );
      
      const monthsInYear = 12;
      const monthsFactor = monthsActive / monthsInYear;
      
      // Project annual earnings if in projection mode
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
        originalEarningsUSD: earningsInUSD,
        taxSystem: currentCountry.taxSystem
      });
    } catch (error) {
      console.error('Error calculating tax estimation:', error);
      // Don't set taxData to null here - we want to keep showing the last good data
    }
  };

  // Enhanced tax calculation logic for each country
  const calculateTaxByCountry = (country, income) => {
    income = Math.max(0, income); // Ensure income is not negative
    
    let incomeTax = 0;
    let additionalTax = 0; // For taxes like self-employment, social security, etc.
    let taxBrackets = [];
    let taxDescription = '';
    
    switch (country) {
      case 'US': // United States (2023 tax brackets)
        taxBrackets = [
          { min: 0, max: 10275, rate: 0.10 },
          { min: 10275, max: 41775, rate: 0.12 },
          { min: 41775, max: 89075, rate: 0.22 },
          { min: 89075, max: 170050, rate: 0.24 },
          { min: 170050, max: 215950, rate: 0.32 },
          { min: 215950, max: Infinity, rate: 0.35 }
        ];
        
        // Calculate progressive tax
        incomeTax = calculateProgressiveTax(income, taxBrackets);
        
        // Self-employment tax (15.3% of 92.35% of net earnings)
        additionalTax = income * 0.9235 * 0.153;
        taxDescription = 'Federal Income Tax + Self-Employment Tax (Social Security & Medicare)';
        break;
        
      case 'UK': // United Kingdom (2023/24 tax year)
        // Personal allowance reduction for high earners
        const personalAllowance = income > 100000 ? 
          Math.max(0, 12570 - (income - 100000) / 2) : 
          12570;
        
        const taxableIncome = Math.max(0, income - personalAllowance);
        
        taxBrackets = [
          { min: 0, max: 37700, rate: 0.20 },
          { min: 37700, max: 150000, rate: 0.40 },
          { min: 150000, max: Infinity, rate: 0.45 }
        ];
        
        incomeTax = calculateProgressiveTax(taxableIncome, taxBrackets);
        
        // National Insurance contributions (Class 4)
        if (income > 9568) {
          additionalTax = (Math.min(income, 50270) - 9568) * 0.092 + 
                         (income > 50270 ? (income - 50270) * 0.032 : 0);
        }
        taxDescription = 'Income Tax + National Insurance Contributions';
        break;
        
      case 'CA': // Canada (2023 federal tax brackets)
        taxBrackets = [
          { min: 0, max: 50197, rate: 0.15 },
          { min: 50197, max: 100392, rate: 0.205 },
          { min: 100392, max: 155625, rate: 0.26 },
          { min: 155625, max: 221708, rate: 0.29 },
          { min: 221708, max: Infinity, rate: 0.33 }
        ];
        
        incomeTax = calculateProgressiveTax(income, taxBrackets);
        
        // CPP + EI (simplified calculation)
        additionalTax = Math.min(income, 61400) * 0.111;
        taxDescription = 'Federal Income Tax + CPP/QPP + EI';
        break;
        
      case 'IN': // India (2023-24 FY)
        taxBrackets = [
          { min: 0, max: 250000, rate: 0 },
          { min: 250000, max: 500000, rate: 0.05 },
          { min: 500000, max: 1000000, rate: 0.20 },
          { min: 1000000, max: Infinity, rate: 0.30 }
        ];
        
        incomeTax = calculateProgressiveTax(income, taxBrackets);
        
        // Health and education cess (4% of income tax)
        additionalTax = incomeTax * 0.04;
        taxDescription = 'Income Tax + Health & Education Cess';
        break;
        
      case 'AU': // Australia (2022-23 FY)
        taxBrackets = [
          { min: 0, max: 18200, rate: 0 },
          { min: 18200, max: 45000, rate: 0.19 },
          { min: 45000, max: 120000, rate: 0.325 },
          { min: 120000, max: 180000, rate: 0.37 },
          { min: 180000, max: Infinity, rate: 0.45 }
        ];
        
        incomeTax = calculateProgressiveTax(income, taxBrackets);
        
        // Medicare Levy (2%)
        additionalTax = income * 0.02;
        taxDescription = 'Income Tax + Medicare Levy';
        break;
        
      case 'DE': // Germany (2023)
        taxBrackets = [
          { min: 0, max: 9744, rate: 0 },
          { min: 9744, max: 14753, rate: 0.14 },
          { min: 14753, max: 57918, rate: 0.42 },
          { min: 57918, max: Infinity, rate: 0.45 }
        ];
        
        incomeTax = calculateProgressiveTax(income, taxBrackets);
        
        // Solidarity surcharge (5.5% of income tax)
        additionalTax = incomeTax * 0.055;
        taxDescription = 'Income Tax + Solidarity Surcharge';
        break;
        
      default:
        // Default flat tax rate for other countries
        incomeTax = income * 0.25;
        taxDescription = 'Estimated Flat Tax Rate';
    }
    
    const totalTax = incomeTax + additionalTax;
    const taxRate = income > 0 ? (totalTax / income) * 100 : 0;
    
    return {
      estimatedTax: Math.round(totalTax * 100) / 100,
      incomeTax: Math.round(incomeTax * 100) / 100,
      additionalTax: Math.round(additionalTax * 100) / 100,
      taxRate: Math.round(taxRate * 10) / 10,
      taxYear: new Date().getFullYear(),
      country,
      taxBrackets,
      taxDescription
    };
  };

  // Helper function to calculate progressive tax
  const calculateProgressiveTax = (income, brackets) => {
    let tax = 0;
    let previousBracketMax = 0;
    
    for (const bracket of brackets) {
      if (income > bracket.min) {
        const taxableAmount = Math.min(income, bracket.max) - Math.max(bracket.min, previousBracketMax);
        tax += taxableAmount * bracket.rate;
        previousBracketMax = bracket.max;
      } else {
        break;
      }
    }
    
    return tax;
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleEarningsChange = (e) => {
    const value = e.target.value;
    // Only update if value is empty or a valid number
    if (value === '' || !isNaN(value)) {
      setCustomEarnings(value);
    }
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
    if (amount === null || amount === undefined) return '-';
    
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

  if (loading || !taxData) {
    return (
      <div className="tax-estimation-card loading">
        <Loader className="loading-spinner" size={32} />
        <p className="loading-text">Preparing your tax estimation...</p>
      </div>
    );
  }

  const currentCountry = countryOptions.find(c => c.value === selectedCountry);
  const monthlyPayment = taxData.currentTaxLiability / Math.min(taxData.monthsActive, 12);
  const quarterlyPayment = taxData.currentTaxLiability / 4;

  return (
    <div className="tax-estimation-card">
      <div className="tax-header">
        <div className="tax-title">
          <Calculator size={24} className="header-icon" />
          <div>
            <h3>Tax Estimation</h3>
            <p className="tax-subtitle">{currentCountry.label} • {taxData.taxSystem}</p>
          </div>
        </div>
        <button 
          className={`info-button ${infoVisible ? 'active' : ''}`}
          onClick={() => setInfoVisible(!infoVisible)}
          aria-label="Tax information"
        >
          <Info size={20} />
        </button>
      </div>
      
      {infoVisible && (
        <div className="tax-info-box">
          <p>
            <strong>Tax Year:</strong> {taxData.taxYear} • <strong>Mode:</strong> {projectionMode ? 'Projected Annual' : 'Actual Earnings'}
          </p>
          <p>{taxData.taxDescription}</p>
          <p>Based on {taxData.monthsActive} month{taxData.monthsActive !== 1 ? 's' : ''} of activity since {new Date(joinDate).toLocaleDateString()}</p>
          {exchangeRateError && (
            <p className="exchange-rate-error">
              <AlertCircle size={14} /> {exchangeRateError}
            </p>
          )}
        </div>
      )}
      
      <div className="tax-controls">
        <div className="control-group">
          <label htmlFor="country-select" className="control-label">
            <Globe size={18} className="label-icon" />
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
            <DollarSign size={18} className="label-icon" />
            Current Earnings (USD)
          </label>
          <input
            id="earnings-input"
            type="number"
            value={customEarnings !== '' ? customEarnings : freelancerEarnings}
            onChange={handleEarningsChange}
            placeholder={`Current earnings: ${freelancerEarnings.toFixed(2)} USD`}
            className="earnings-input"
            min="0"
            step="100"
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
            <Calendar size={18} className="label-icon" />
            Join Date
          </label>
          <input
            id="join-date"
            type="date"
            value={joinDate}
            onChange={handleJoinDateChange}
            className="date-input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="control-group">
          <label className="control-label">
            <TrendingUp size={18} className="label-icon" />
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
            <div className="summary-note">
              Effective Rate: {taxData.taxRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
      
      <div className="tax-breakdown">
        <div className="breakdown-header">
          <PieChart size={20} className="breakdown-icon" />
          <h4>Tax Breakdown</h4>
        </div>
        
        <div className="breakdown-items">
          <div className="breakdown-item">
            <span>Income Tax:</span>
            <span>{formatCurrency(
              projectionMode ? 
                taxData.incomeTax * (taxData.monthsActive / 12) : 
                taxData.incomeTax
            )}</span>
          </div>
          
          {taxData.additionalTax > 0 && (
            <div className="breakdown-item">
              <span>{selectedCountry === 'US' ? 'Self-Employment Tax' : 
                    selectedCountry === 'UK' ? 'National Insurance' : 
                    selectedCountry === 'CA' ? 'CPP + EI' : 
                    selectedCountry === 'IN' ? 'Health & Education Cess' : 
                    selectedCountry === 'AU' ? 'Medicare Levy' : 
                    selectedCountry === 'DE' ? 'Solidarity Surcharge' : 
                    'Additional Tax'}:</span>
              <span>{formatCurrency(
                projectionMode ? 
                  taxData.additionalTax * (taxData.monthsActive / 12) : 
                  taxData.additionalTax
              )}</span>
            </div>
          )}
          
          <div className="breakdown-item total">
            <span>Total Tax Liability:</span>
            <span>{formatCurrency(taxData.currentTaxLiability)}</span>
          </div>
        </div>
      </div>
      
      <div className="payment-planning">
        <h4 className="planning-header">
          <span>Payment Planning</span>
          {taxData.monthsActive < 3 && (
            <span className="new-freelancer-badge">New Freelancer</span>
          )}
        </h4>
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
      
      {taxData.taxBrackets && taxData.taxBrackets.length > 0 && (
        <div className="tax-brackets">
          <h4 className="brackets-header">Tax Brackets Applied</h4>
          <div className="brackets-grid">
            {taxData.taxBrackets.map((bracket, index) => (
              <div key={index} className="bracket-item">
                <div className="bracket-range">
                  {bracket.min === 0 ? 'Up to' : formatCurrency(bracket.min)} -{' '}
                  {bracket.max === Infinity ? 'Above' : formatCurrency(bracket.max)}
                </div>
                <div className="bracket-rate">{(bracket.rate * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="tax-disclaimer">
        <AlertCircle size={16} className="disclaimer-icon" />
        <span>
          This is an estimate for {taxData.country} tax system. Tax laws change frequently and 
          this calculator doesn't account for all possible deductions or credits. 
          {exchangeRateError && ' ' + exchangeRateError} Always consult a qualified tax professional.
        </span>
      </div>
      
      <div className="action-buttons">
        <button 
          className="recalculate-button"
          onClick={handleRecalculate}
        >
          <RefreshCw size={16} className="button-icon" />
          Recalculate Taxes
        </button>
        
        {selectedCountry !== 'US' && (
          <button 
            className="refresh-rates-button"
            onClick={handleRefreshRates}
            disabled={exchangeRateLoading}
          >
            {exchangeRateLoading ? (
              <Loader size={16} className="button-icon spin" />
            ) : (
              <RefreshCw size={16} className="button-icon" />
            )}
            {exchangeRateLoading ? 'Updating Rates...' : 'Refresh Exchange Rates'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaxEstimationComponent;