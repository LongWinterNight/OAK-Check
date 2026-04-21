const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

const ROLE_LABELS: Record<string, string> = {
  ARTIST: 'Артист',
  QA:     'QA-специалист',
  LEAD:   'Лид / Art Director',
  POST:   'Постпродакшн',
  PM:     'Менеджер проекта',
  ADMIN:  'Администратор',
};

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ARTIST: { bg: '#F2EEE5', border: '#C9C1B1', text: '#6A6558' },
  QA:     { bg: '#EBF1FC', border: '#A8C4F0', text: '#2563B0' },
  LEAD:   { bg: '#FBF4E8', border: '#DDB87A', text: '#8C5E1E' },
  POST:   { bg: '#EDFAF0', border: '#8ED4A0', text: '#3F8C4A' },
  PM:     { bg: '#EBF2FF', border: '#93BFFF', text: '#1E6FE0' },
  ADMIN:  { bg: '#FDECEA', border: '#F0A89D', text: '#B8402D' },
};

type InviteEmailPayload = {
  to: string;
  token: string;
  inviterName: string;
  role: string;
};

function buildInviteHtml({ to, token, inviterName, role }: InviteEmailPayload): string {
  const url = `${BASE_URL}/invite/${token}`;
  const roleLabel = ROLE_LABELS[role] ?? role;
  const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.ARTIST;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Приглашение в OAK·Check</title>
</head>
<body style="margin:0;padding:0;background:#F7F4EE;font-family:'Inter Tight',ui-sans-serif,system-ui,-apple-system,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F4EE;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Хедер / Логотип -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <!-- Иконка OAK -->
                      <div style="width:36px;height:36px;background:#1A1813;border-radius:10px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:36px;">
                        <span style="color:#C89B54;font-size:16px;font-weight:700;letter-spacing:-0.5px;">O</span>
                      </div>
                      <div style="display:inline-block;vertical-align:middle;margin-left:10px;">
                        <div style="font-size:18px;font-weight:700;color:#1A1813;letter-spacing:-0.3px;line-height:1;">OAK·Check</div>
                        <div style="font-size:10px;color:#8F897B;font-family:'JetBrains Mono',ui-monospace,monospace;margin-top:2px;letter-spacing:0.5px;">STUDIO · PIPELINE</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Основная карточка -->
          <tr>
            <td style="background:#FFFFFF;border:1px solid #E2DCD0;border-radius:16px;overflow:hidden;">

              <!-- Верхняя полоса -->
              <div style="height:4px;background:linear-gradient(90deg,#1E6FE0 0%,#8C5E1E 50%,#3F8C4A 100%);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:36px 36px 32px;">

                <!-- Заголовок -->
                <tr>
                  <td style="padding-bottom:24px;border-bottom:1px solid #F2EEE5;">
                    <div style="font-size:22px;font-weight:700;color:#1A1813;margin-bottom:6px;letter-spacing:-0.4px;">
                      Вас приглашают в команду
                    </div>
                    <div style="font-size:14px;color:#6A6558;line-height:1.6;">
                      <strong style="color:#1A1813;">${inviterName}</strong> добавляет вас
                      в систему управления продакшном <strong style="color:#1A1813;">OAK·Check</strong>.
                    </div>
                  </td>
                </tr>

                <!-- Кому / Роль -->
                <tr>
                  <td style="padding:20px 0;border-bottom:1px solid #F2EEE5;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Email -->
                        <td width="50%" style="vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;color:#8F897B;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">
                            Аккаунт
                          </div>
                          <div style="font-size:14px;color:#1A1813;font-weight:500;">${to}</div>
                        </td>
                        <!-- Роль -->
                        <td width="50%" style="vertical-align:top;text-align:right;">
                          <div style="font-size:11px;font-weight:600;color:#8F897B;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">
                            Роль
                          </div>
                          <span style="display:inline-block;padding:4px 12px;background:${roleColor.bg};border:1px solid ${roleColor.border};border-radius:100px;font-size:12px;font-weight:600;color:${roleColor.text};">
                            ${roleLabel}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Что ждёт -->
                <tr>
                  <td style="padding:20px 0 24px;">
                    <div style="font-size:11px;font-weight:600;color:#8F897B;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">
                      В системе вы сможете
                    </div>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#3F8C4A;margin-right:8px;font-size:14px;">✓</span>
                          <span style="font-size:13px;color:#6A6558;">Следить за статусом шотов и дедлайнами</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#3F8C4A;margin-right:8px;font-size:14px;">✓</span>
                          <span style="font-size:13px;color:#6A6558;">Работать с чеклистами и этапами сдачи</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#3F8C4A;margin-right:8px;font-size:14px;">✓</span>
                          <span style="font-size:13px;color:#6A6558;">Оставлять комментарии и загружать рендеры</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA кнопка -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <a href="${url}"
                      style="display:inline-block;background:#1A1813;color:#FFFFFF;text-decoration:none;
                        font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;
                        letter-spacing:-0.1px;border:1px solid #1A1813;">
                      Принять приглашение &rarr;
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Футер -->
          <tr>
            <td style="padding:20px 4px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #E2DCD0;padding-top:16px;">
                    <div style="font-size:11px;color:#8F897B;line-height:1.6;margin-bottom:8px;">
                      Ссылка действительна <strong>48 часов</strong>.
                      Если вы не ожидали этого письма — просто проигнорируйте его.
                    </div>
                    <div style="font-size:10px;color:#C9C1B1;font-family:'JetBrains Mono',ui-monospace,monospace;word-break:break-all;">
                      ${url}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function sendInviteEmail({ to, token, inviterName, role }: InviteEmailPayload): Promise<void> {
  const url = `${BASE_URL}/invite/${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[EMAIL] Приглашение для ${to} (роль: ${role}):\n  ${url}\n`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'OAK·Check <noreply@oak3d.ru>',
    to,
    subject: `${inviterName} приглашает вас в OAK·Check`,
    html: buildInviteHtml({ to, token, inviterName, role }),
  });
}
