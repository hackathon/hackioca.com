import React from "react";
import styled from "styled-components";

interface SocialLinkProps {
  name: string;
  icon: string;
  link: string;
}

const IMG_PATH = "/images/socials/";

const SocialImg = styled.img`
  width: 30px;
`;

const SocialLink: React.FC<SocialLinkProps> = ({ name, icon, link }) => (
  <a key={name} href={link}>
    <SocialImg src={`${IMG_PATH}${icon}`} alt={name} />
  </a>
);

export default SocialLink;