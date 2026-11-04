import { DIAL_CODES, digitsOnly } from '../lib/phone';

export default function PhoneInput({ id, dial, number, onDial, onNumber, invalid, autoFocus }) {
  return (
    <div className={`phone-input${invalid ? ' invalid' : ''}`}>
      <select aria-label="Country code" value={dial} onChange={(e) => onDial(e.target.value)}>
        {DIAL_CODES.map(([code, country]) => <option key={code} value={code}>{country} {code}</option>)}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        maxLength={15}
        autoFocus={autoFocus}
        aria-invalid={invalid}
        value={number}
        onChange={(e) => onNumber(digitsOnly(e.target.value))}
      />
    </div>
  );
}
