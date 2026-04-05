import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import * as jwt from "jsonwebtoken";
import { error } from "./response";
import { getOrCreateUser } from "../services/userService";
import { JwksClient } from "jwks-rsa";

const client = new JwksClient({
  // jwksUri: `https://login.microsoftonline.com/common/discovery/v1.0/keys`,
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err, undefined);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

export type AuthenticatedHandler = (
  request: HttpRequest,
  context: InvocationContext,
  user: any,
) => Promise<HttpResponseInit>;

export const withAuth = (handler: AuthenticatedHandler) => {
  return async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    try {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return error("Unauthorized: No token provided", 401);
      }

      const token = authHeader.split(" ")[1];

      const decoded: any = await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            audience: process.env.CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
          },
          (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
          },
        );
      });

      const user = await getOrCreateUser({
        oid: decoded.oid,
        tid: decoded.tid,
        name: decoded.name,
        preferred_username: decoded.preferred_username,
      });

      return handler(request, context, user);
    } catch (err: any) {
      context.log("Authentication Error:", err.message);
      return error(`Unauthorized: ${err.message}`, 401);
    }
  };
};
