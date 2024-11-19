import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const isAuth = !!token;
      const isAuthPage =
        req.nextUrl.pathname.startsWith("/auth/signin") ||
        req.nextUrl.pathname.startsWith("/auth/signup");

      if (isAuthPage) {
        return !isAuth;
      } else {
        return isAuth;
      }
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lectures/:path*",
    "/api/upload/:path*",
    "/auth/signin",
    "/auth/signup",
  ],
};
