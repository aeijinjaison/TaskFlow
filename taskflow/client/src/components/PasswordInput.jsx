import { useState } from 'react';
import Icon from './Icon';

export default function PasswordInput({ id, value, onChange, autoComplete, invalid, describedBy, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      <button type="button" className="icon-btn" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  );
}
