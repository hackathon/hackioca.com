import React, { useState, useCallback } from "react";
import styled from "styled-components";
import media from "src/utils/media";
import copy from "src/copy";
import { Button } from "@hackthenorth/north";

import Body from "src/components/Body";
import TextInput from "src/components/TextInput";

// Augment window to include HackerAPI definition
declare global {
  interface Window {
    // eslint-disable-next-line
    HackerAPI: any;
  }
}

interface FormProps {
  width: string;
}

interface MailingListProps {
  isFooter?: boolean;
}

// duration before state reverts back to ready
const REVERT_STATE_TIME = 2500;

// Email validation logic, taken from
// https://github.com/hackathon/hackthenorth.com/blob/master/src/components/StyledInput/index.jsx
const validateEmailAddress = (email: string) => {
  const emailPrefix = "[A-Z0-9a-z]([A-Z0-9a-z._%+-]{0,30}[A-Z0-9a-z])?";
  const emailServer = "([A-Z0-9a-z]([A-Z0-9a-z-]{0,30}[A-Z0-9a-z])?\\.){1,5}";
  const emailRegEx = `${emailPrefix}@${emailServer}[A-Za-z]{2,6}`;
  if (email.match(emailRegEx)) {
    return true;
  }
  return false;
};

const Container = styled.form<FormProps>`
  position: relative;
  width: ${props => props.width};
  height: 50px;
  margin: 0 auto;
  position: relative;

  font-family: Raleway;
  line-height: 100%;

  ${media.phone`
    width: 85vw;
    height: 40px;
    font-size: 14px;
  `}
`;

const SubText = styled(Body)`
  margin-top: 10px;
  text-align: center;
  z-index: 1;
  color: ${props => props.color};

  ${media.phone`
    width: 75vw;
    margin: 10px auto;
    font-size: 12px;
  `}
`;

const AnimSpan = styled.span`
  @keyframes shake {
    0% {
      transform: translate(4px, 0);
    }
    50% {
      transform: translate(-4px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  position: absolute;
  right: 0;
  width: 170px;
  height: 100%;

  &.shake {
    animation: shake 200ms 2 linear;
  }
`;

const MailingListSignup: React.FC<MailingListProps> = ({ isFooter }) => {
  const [signupState, updateSignupState] = useState("ready");
  const [canSubmit, updateCanSubmit] = useState(true);
  const [email, updateEmail] = useState("");
  const [shouldShake, toggleShake] = useState(false);
  const { HackerAPI } = window;

  const triggerError = (newState: string) => {
    updateSignupState(newState);
    updateCanSubmit(true);
    toggleShake(true);
    // Go back to default ready state after set period of time
    setTimeout(() => {
      updateSignupState("ready");
    }, REVERT_STATE_TIME);
  };
  const signupForMailingList = useCallback(
    e => {
      e.preventDefault(); // stop page from refreshing onSubmit

      if (!canSubmit) return; // stop submission if they've submitted in the last 2 seconds

      updateCanSubmit(false); // prevent duplicate submissions while making API request

      if (validateEmailAddress(email)) {
        HackerAPI.Event.MailingListSignup.create(
          new HackerAPI.Event({ slug: "hackioca" }),
          new HackerAPI.Event.MailingListSignup({ email })
        )
          .then((data: { email: string; alreadySignedUp: boolean }) => {
            if (data && "email" in data) {
              if (data.alreadySignedUp) {
                updateSignupState("dupe");
                toggleShake(true);
              } else {
                // success
                updateSignupState("success");
                updateEmail("");
              }
            } else {
              // signup error
              triggerError("error");
            }
          })
          .catch(() => {
            // request error
            triggerError("error");
          });
      } else {
        // email validation failed
        triggerError("invalid");
      }

      // allow submissions after API request has resolved and
      // a period of time has passed
      setTimeout(() => {
        updateCanSubmit(true);
      }, REVERT_STATE_TIME);
    },
    [email, canSubmit]
  ); // only recreate this function if email changes

  let buttonVariant;
  switch (signupState) {
    case "ready":
      break;
    case "success":
      buttonVariant = "success";
      break;
    default:
      buttonVariant = "error"; // all other states are error
  }

  return (
    <>
      <Container
        width={isFooter ? "100%" : "550px"}
        onSubmit={e => signupForMailingList(e)}
      >
        <TextInput
          placeholder={copy.hero.signupPlaceholder[signupState]}
          type="email"
          value={email}
          onChange={(newEmail: string) => updateEmail(newEmail)}
        />
        <AnimSpan
          className={shouldShake ? "shake" : ""}
          onAnimationEnd={() => toggleShake(false)}
        >
          <Button variant={buttonVariant} onClick={signupForMailingList}>
            {copy.hero.button[signupState]}
          </Button>
        </AnimSpan>
      </Container>
      <SubText color={isFooter ? "#fff" : ""}>
        {copy.hero.signup[signupState]}
      </SubText>
    </>
  );
};

export default MailingListSignup;
