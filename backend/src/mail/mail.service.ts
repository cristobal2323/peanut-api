import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    let host = process.env.SMTP_HOST;
    const isGmail = !host && user?.includes("gmail.com");
    if (!host && isGmail) {
      host = "smtp.gmail.com";
    }
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : false;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
    }
  }

  private ensureTransporter() {
    if (!this.transporter) {
      throw new InternalServerErrorException(
        "Email transport is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS."
      );
    }
  }

  async sendPasswordReset(email: string, newPassword: string, name?: string) {
    this.ensureTransporter();
    const from = process.env.EMAIL_FROM || "no-reply@peanut.local";

    await this.transporter!.sendMail({
      to: email,
      from,
      subject: "Peanut - Recuperacion de contrasena",
      text: `Hola${
        name ? ` ${name}` : ""
      },\n\nAqui tienes tu nueva contrasena temporal: ${newPassword}\n\nPor favor inicia sesion y cambiala cuanto antes.\n\nEquipo Peanut`,
      html: `<p>Hola${
        name ? ` ${name}` : ""
      },</p><p>Aqui tienes tu nueva contrasena temporal:</p><p><strong>${newPassword}</strong></p><p>Por favor inicia sesion y cambiala cuanto antes.</p><p>Equipo Peanut</p>`,
    });
  }
}
