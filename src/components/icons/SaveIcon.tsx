import * as React from "react";
import { SVGProps } from "react";
const SaveIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width={64}
    height={64}
    fill="none"
    viewBox="0 0 24 24"
  >
    <g
      stroke="#292D32"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    >
      <path d="M12.89 5.88H5.11A3.12 3.12 0 0 0 2 8.99v11.36c0 1.45 1.04 2.07 2.31 1.36l3.93-2.19c.42-.23 1.1-.23 1.51 0l3.93 2.19c1.27.71 2.31.09 2.31-1.36V8.99a3.105 3.105 0 0 0-3.1-3.11Z" />
      <path d="M16 8.99v11.36c0 1.45-1.04 2.06-2.31 1.36l-3.93-2.19c-.42-.23-1.1-.23-1.52 0l-3.93 2.19c-1.27.7-2.31.09-2.31-1.36V8.99c0-1.71 1.4-3.11 3.11-3.11h7.78c1.71 0 3.11 1.4 3.11 3.11Z" />
      <path d="M22 5.11v11.36c0 1.45-1.04 2.06-2.31 1.36L16 15.77V8.99c0-1.71-1.4-3.11-3.11-3.11H8v-.77C8 3.4 9.4 2 11.11 2h7.78C20.6 2 22 3.4 22 5.11Z" />
    </g>
  </svg>
);
export default SaveIcon;