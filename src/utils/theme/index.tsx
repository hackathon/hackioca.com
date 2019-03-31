import styled from "styled-components";
import { css, ThemeDefinition, UnstyledButton } from "@hackthenorth/north";

import media from "src/utils/media";
import globalStyles from "./globalStyles";

const theme: ThemeDefinition = {
  globalStyles,
  button: {
    component: styled(UnstyledButton)`
      font-family: Raleway, sans-serif;
      font-weight: 600;
    `,
    variants: {
      hero: css`
        position: absolute;
        width: 170px;
        height: 100%;
        right: 0;
        display: inline-block;
        border-top-right-radius: 999px;
        border-bottom-right-radius: 999px;

        color: white;
        text-align: center;
        line-height: 100%;

        background-color: #51192c;
        cursor: pointer;

        transition: color 200ms ease-in-out;
        &:hover,
        &:focus {
          color: #cccccc;
        }

        ${media.phone`
          width: 25vw;
        `}
      `
    }
  }
};

export default theme;
