// Summary Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
  // Get user name from session
  const userName = sessionStorage.getItem('userName') || 'Champion';
  document.getElementById('user-name').textContent = userName;
  document.getElementById('cert-user-name').textContent = userName;
  
  // Set current date on certificate
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  document.getElementById('cert-date').textContent = dateStr;
  
  // Count completed scenarios by type
  const scenarios = {
    email: ['e1', 'e2', 'e3', 'e4', 'e5'],
    sms: ['sms1', 'sms2', 'sms3'],
    vishing: ['vishing1', 'vishing2']
  };
  
  let emailCompleted = 0;
  let smsCompleted = 0;
  let vishingCompleted = 0;
  
  scenarios.email.forEach(id => {
    if (sessionStorage.getItem(`scenario:${id}:done`) === "1") {
      emailCompleted++;
    }
  });
  
  scenarios.sms.forEach(id => {
    if (sessionStorage.getItem(`scenario:${id}:done`) === "1") {
      smsCompleted++;
    }
  });
  
  scenarios.vishing.forEach(id => {
    if (sessionStorage.getItem(`scenario:${id}:done`) === "1") {
      vishingCompleted++;
    }
  });
  
  const totalCompleted = emailCompleted + smsCompleted + vishingCompleted;
  
  // Update stat cards with animation
  animateCounter('email-count', emailCompleted);
  animateCounter('sms-count', smsCompleted);
  animateCounter('vishing-count', vishingCompleted);
  animateCounter('total-count', totalCompleted);
  
  // Print certificate button - only prints the certificate
  document.getElementById('print-cert-btn').addEventListener('click', printCertificate);
});

// Animate counter from 0 to target
function animateCounter(elementId, target) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let current = 0;
  const increment = target / 30; // 30 steps
  const duration = 1500; // 1.5 seconds
  const stepTime = duration / 30;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, stepTime);
}

// Print only the certificate
function printCertificate() {
  // Get the certificate element
  const certificate = document.getElementById('certificate-printable');
  
  // Create a new window for printing
  const printWindow = window.open('', '', 'height=600,width=800');
  
  // Get all stylesheets
  let styles = '';
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      if (sheet.href) {
        styles += `<link rel="stylesheet" href="${sheet.href}">`;
      } else if (sheet.cssRules) {
        styles += '<style>';
        for (let j = 0; j < sheet.cssRules.length; j++) {
          styles += sheet.cssRules[j].cssText;
        }
        styles += '</style>';
      }
    } catch (e) {
      // Skip stylesheets that can't be accessed (CORS)
      if (document.styleSheets[i].href) {
        styles += `<link rel="stylesheet" href="${document.styleSheets[i].href}">`;
      }
    }
  }
  
  // Write the certificate HTML with styles
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate of Completion</title>
      ${styles}
      <style>
        body {
          margin: 0;
          padding: 20px;
          background: #fff !important;
          font-family: 'Aptos', 'Segoe UI', sans-serif;
        }
        .certificate-card {
          background: #fff;
          border-radius: 18px;
          padding: 50px 40px;
          border: 8px solid #667eea;
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }
        .certificate-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
        }
        .certificate-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .cert-badge {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .certificate-header h2 {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .certificate-body {
          text-align: center;
        }
        .cert-text {
          font-size: 18px;
          color: #64748b;
          margin: 8px 0;
        }
        .cert-name {
          font-size: 42px;
          font-weight: 800;
          color: #667eea;
          margin: 16px 0;
          font-style: italic;
        }
        .cert-course {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 16px 0;
        }
        .cert-details {
          font-size: 16px;
          color: #64748b;
          margin: 8px 0;
          font-weight: 600;
        }
        .cert-date {
          font-size: 14px;
          color: #94a3b8;
          margin: 16px 0 0 0;
          font-style: italic;
        }
        .certificate-footer {
          display: none !important;
        }
        @media print {
          body {
            background: #fff !important;
          }
          .certificate-card {
            border: 8px solid #667eea;
          }
        }
      </style>
    </head>
    <body>
      ${certificate.outerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = function() {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
}
