import React from 'react';

export default function SectionHeading({ eyebrow, title, titleClassName = '', action }) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className={['section-title', titleClassName].filter(Boolean).join(' ')}>{title}</h2>
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}