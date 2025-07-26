import Imap from 'imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

export async function getLatestOtpFromEmail(): Promise<string> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.TEST_EMAIL,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '993'),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    function openInbox(cb: any) {
      imap.openBox('INBOX', false, cb);
    }

    imap.once('ready', function () {
      openInbox(function (err: any, box: any) {
        if (err) return reject(err);

        // Try 'ALL' instead of 'UNSEEN' if needed
        imap.search(['UNSEEN'], function (err, results) {
          if (err || !results || results.length === 0) {
            imap.end();
            return reject(new Error('❌ No unread OTP emails found.'));
          }

          const latest = results[results.length - 1];
          const fetch = imap.fetch(latest, { bodies: '' });

          fetch.on('message', function (msg, seqno) {
            msg.on('body', function (stream, info) {
              simpleParser(stream, async (err, parsed) => {
                if (err) return reject(err);

                const text = parsed.text || '';
                const match = text.match(/(\d{6})/);
                if (match) {
                  const otp = match[1];
                  imap.end();
                  return resolve(otp);
                } else {
                  imap.end();
                  return reject(new Error('❌ OTP not found in email body.'));
                }
              });
            });
          });

          fetch.once('error', function (err) {
            return reject(err);
          });
        });
      });
    });

    imap.once('error', function (err) {
      return reject(err);
    });

    imap.once('end', function () {
      console.log('📭 Connection to email closed');
    });

    imap.connect();
  });
}
