const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

type InviteEmailPayload = {
  to: string;
  token: string;
  inviterName: string;
  role: string;
};

export async function sendInviteEmail({ to, token, inviterName, role }: InviteEmailPayload): Promise<void> {
  const url = `${BASE_URL}/invite/${token}`;

  // Без RESEND_API_KEY — выводим ссылку в консоль (dev-режим)
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
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; background: #F7F4EE; padding: 40px 24px;">
        <div style="background: #fff; border: 1px solid #E2DCD0; border-radius: 16px; padding: 36px 32px;">
          <div style="font-size: 20px; font-weight: 700; color: #1A1813; margin-bottom: 8px;">OAK·Check</div>
          <div style="font-size: 12px; color: #8F897B; font-family: monospace; margin-bottom: 28px;">studio · 3DsMax pipeline</div>

          <h2 style="font-size: 18px; font-weight: 600; color: #1A1813; margin: 0 0 12px;">Вас приглашают в команду</h2>
          <p style="font-size: 14px; color: #6A6558; margin: 0 0 8px;">
            <strong style="color: #1A1813;">${inviterName}</strong> добавил вас в систему управления чеклистами OAK·Check.
          </p>
          <p style="font-size: 13px; color: #6A6558; margin: 0 0 28px;">
            Ваша роль: <strong style="color: #1A1813;">${role}</strong>
          </p>

          <a href="${url}" style="display: inline-block; background: #1E6FE0; color: #fff; text-decoration: none;
            font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
            Принять приглашение
          </a>

          <p style="font-size: 12px; color: #8F897B; margin: 24px 0 0;">
            Ссылка действительна 48 часов. Если вы не ожидали этого письма — просто проигнорируйте его.
          </p>
          <p style="font-size: 11px; color: #C9C1B1; margin: 12px 0 0; word-break: break-all;">${url}</p>
        </div>
      </div>
    `,
  });
}
