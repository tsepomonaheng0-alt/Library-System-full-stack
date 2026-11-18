// Label + input + inline error, so every form looks and behaves the same.
export default function Field({ label, name, error, children }) {
  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
