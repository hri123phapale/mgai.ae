/* ==========================================================
   Contact form settings. Change only this file to switch
   where form submissions go.

   provider options:
     "formsubmit" – no account needed. Submissions are emailed to
                    `email`. The FIRST submission sends a one-time
                    activation email to that inbox; click it once and
                    all later messages arrive normally.
     "web3forms"  – free account at web3forms.com, put the access key
                    in `web3formsKey`.
     "formspree"  – free account at formspree.io, put the form id
                    (the part after /f/) in `formspreeId`.
     "endpoint"   – any other form service URL that accepts a JSON
                    POST of {name,email,phone,message,lang}.
   ========================================================== */
window.MGAI_CONFIG = {
  provider: "formsubmit",
  email: "info@mgai.ae",
  web3formsKey: "",
  formspreeId: "",
  endpoint: "",
  subject: "New enquiry from mgai.ae"
};
