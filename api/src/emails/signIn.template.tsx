import React from "react";
import { Html, Head, Body, Container, Section, Text, Heading, Link, render, Img } from '@react-email/components';


interface SignInData {
    name: string;
}



export const WelcomeEmail = ({ name }: SignInData) => {
    return (
      <Html>
        <Head />
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Img
              alt="Ode Grinder"
              style={styles.rounded}
              height={80}
              src='/static/singleLogoRed.png'
            />
            <Heading style={styles.heading}>Welcome to {Bun.env.PLATFORM_NAME}, {name}!</Heading>
            <Text style={styles.text}>
              We're excited to have you on board. You are one step left to getting amazing listings from our platform. 
            </Text>
            <Text style={styles.text}>
              If you have any questions, feel free to reach out to our support team. We're here to help!
            </Text>
            <Text style={styles.footer}>Cheers, <br /> The Team</Text>
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
    buttonSection: {
      textAlign: 'center' as 'center',
      margin: '20px 0',
    },
    button: {
      display: 'inline-block',
      backgroundColor: '#4CAF50',
      color: '#ffffff',
      padding: '10px 20px',
      fontSize: '16px',
      textDecoration: 'none',
      borderRadius: '5px',
    },
    footer: {
      fontSize: '14px',
      color: '#888888',
      marginTop: '20px',
      textAlign: 'center' as 'center',
    },
  };
  


export const signIn = async (data: SignInData): Promise<string> => {
    return await render(<WelcomeEmail name={data.name}/>);
};

export default WelcomeEmail