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
    HackerAPI: any;
  }
}

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

const Container = styled.form`
  position: relative;
  width: 550px;
  height: 50px;
  margin: auto;
  position: relative;

  font-family: Raleway;
  line-height: 100%;

  overflow: hidden;

  ${media.phone`
    width: 85vw;
    height: 40px;
    font-size: 14px;
  `}
`;

const SubText = styled(Body)`
  margin-top: 10px;
  text-align: center;

  ${media.phone`
    width: 75vw;
    margin: 10px auto;
    font-size: 12px;
  `}
`;

const MailingListSignup: React.FC = () => {
  const [signupState, updateSignupState] = useState("ready");
  const [email, updateEmail] = useState("");
  const [signups, updateSignups] = useState(0);

  const { HackerAPI } = window;
  const signupForMailingList = useCallback(
    e => {
      e.preventDefault(); // stop page from refreshing onSubmit

      if (validateEmailAddress(email)) {
        updateSignupState("success");
        HackerAPI.Event.MailingListSignup.create(
          new HackerAPI.Event({ slug: "hackioca" }),
          new HackerAPI.Event.MailingListSignup({ email })
        )
          .then((data: { email: string }) => {
            if (data && data.email) {
              // success
              updateSignupState("success");
              updateEmail("");
              updateSignups(signups + 1);
            } else {
              // signup error
              updateSignupState("error");
            }
          })
          .catch(() => {
            // request error
            updateSignupState("error");
          });
      } else {
        // email validation failed
        updateSignupState("invalid");
        updateEmail("");
      }
    },
    [email]
  ); // only recreate this function if email changes

  return (
    <>
      <Container onSubmit={e => signupForMailingList(e)}>
        <TextInput
          placeholder={`gimmemyboba${signups !== 0 ? signups + 1 : ""}@gmail.com`}
          type="email"
          value={email}
          onChange={(newEmail: string) => updateEmail(newEmail)}
        />
        <Button variant="hero" onClick={signupForMailingList}>
          Order Now
        </Button>
      </Container>
      <SubText>{copy.hero.signup[signupState]}</SubText>
    </>
  );
};

export default MailingListSignup;
