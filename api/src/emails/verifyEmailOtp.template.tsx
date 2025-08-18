import React from "react";
import { Html, Head, Body, Container, Section, Text, Heading, Link, render, Img } from '@react-email/components';


const host = Bun.env.ACTIVE_API_ORIGIN

interface SignInData {
    name: string;
    otp: string;
}
export const VerifyEmailOtp = ({ name, otp }: SignInData) => {
    return (
      <Html>
        <Head />
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.heading}>Hey, {name}!</Heading>
            <Text style={styles.text}>
                Get your email verifyed throught the OTP provided. This token expires in 10 munites
            </Text>
            <Text style={styles.textBB}>
                {otp}
            </Text>
            <Text style={styles.text}>
              If you have any questions, feel free to reach out to our support team. We're here to help!
            </Text>
            <Text style={styles.footer}>Cheers, <br /> The  {Bun.env.PLATFORM_NAME} Team</Text>
          </Container>
        </Body>
      </Html>
    );
  };
  
  const styles = {
    rounded:{
      borderRadius: '100px',
    },
    body: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      margin: 0,
      padding: 0,
    },
    container: {
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      fontSize: '24px',
      color: '#333333',
      marginBottom: '20px',
    },
    text: {
      fontSize: '16px',
      color: '#555555',
      lineHeight: '1.5',
      marginBottom: '20px',
    },
    textBB:{
        fontSize: '1.5rem',
        color: '#000',
        lineHeight: '2rem',
        marginBottom: '20px',
    },
    footer: {
      fontSize: '14px',
      color: '#888888',
      marginTop: '20px',
      textAlign: 'center' as 'center',
    },
  };
  


export const verifyOtpEmail = async (data: SignInData): Promise<string> => {
    return await render(<VerifyEmailOtp name={data.name} otp={data.otp}/>);
};

export default VerifyEmailOtp