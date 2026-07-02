import React from 'react';

export default function FAQ() {
  return (
    <div className="dashboard-layout" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111827' }}>FAQ & How It Works</h1>
      
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2563eb', marginBottom: '1rem' }}>The TownTicker Concept</h2>
        <p style={{ lineHeight: 1.6, color: '#4b5563', marginBottom: '1rem' }}>
          <strong>TownTicker</strong> is a self-serve advertising platform designed to empower local publishers, newsletters, and blogs to easily monetize their audience without the hassle of manual ad sales, invoicing, or negotiations.
        </p>
        <p style={{ lineHeight: 1.6, color: '#4b5563', marginBottom: '1rem' }}>
          By embedding the TownTicker widget on your website, you create a dedicated space where local businesses can purchase ad placements directly from you. It acts as an automated storefront for your digital real estate.
        </p>
        <p style={{ lineHeight: 1.6, color: '#4b5563', marginBottom: '1rem' }}>
          <strong>Accessible, Affordable Advertising:</strong> Traditional ad sales often require thousands of dollars and weeks of negotiation—pricing out the local mom-and-pop shops in your community. Because TownTicker is fully automated, publishers can profitably offer much smaller, cheaper ad slots (e.g. $50 for a week). This opens the door for small local businesses that cannot afford expensive agency contracts, while simultaneously unlocking a completely new tier of revenue for the publisher.
        </p>
        <p style={{ lineHeight: 1.6, color: '#4b5563', marginBottom: '1rem' }}>
          <strong>How the flow works:</strong>
        </p>
        <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>You define your ad tiers, pricing, and the information you want to collect (like a headline, image, or link).</li>
          <li>You embed the widget on your site and share your custom Advertiser Portal link with local businesses.</li>
          <li>Advertisers visit your portal, fill out their ad details, select a date/duration, and pay instantly via Stripe.</li>
          <li>Once paid, the ad immediately goes live on your website's TownTicker widget (or schedules for the future, if selected).</li>
          <li>You collect the revenue automatically directly to your bank account via Stripe Connect!</li>
        </ul>
        <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
          You retain full control over what appears on your site. Through the Ad Moderation Queue, you can review active and expired ads, and instantly reject and refund any ad that violates your guidelines with a single click.
        </p>
      </div>

      <div className="panel faq-panel" style={{ marginBottom: '2rem' }}>
        <h2>Frequently Asked Questions</h2>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>How do I get paid?</h4>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>
              Once you've onboarded with Stripe on the Dashboard page, payments for your sold ads are processed and paid out to your bank account automatically by Stripe (minus our platform fee).
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Can I customize the advertiser form?</h4>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>
              Yes! You can use the "Advanced Customization" section on your Dashboard to dynamically change the fields advertisers have to fill out when buying an ad.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>How do I embed the widget?</h4>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>
              Just copy the two lines of HTML code provided in the "Embed Your Widget" section on your Dashboard and paste it anywhere on your website. The widget will automatically load and display active ads.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>How do I refund an advertiser?</h4>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>
              You can find any active or expired ad in the "Ad Moderation Queue" on your Dashboard. Clicking "Reject & Refund" (or "Refund") will instantly refund the buyer and remove the ad from your widget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
