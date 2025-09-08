import { colors, spacing, typography } from '@/src/utils/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsAndConditionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Terms and Conditions</Text>
      </View>
      
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the Matur Chat App, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you may not access or use the app.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our app, you agree to our Privacy Policy.
          </Text>
          
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
          </Text>
          
          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you submit, post, or display on or through the app. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Prohibited Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to engage in any of the following prohibited activities: (1) copying, distributing, or disclosing any part of the app; (2) using any automated system to access the app; (3) transmitting content that contains viruses or other harmful code; (4) interfering with the proper working of the app.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The app and its original content, features, and functionality are owned by Matur and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the app immediately, without prior notice or liability, for any reason, including if you breach the Terms and Conditions.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall Matur, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.
          </Text>
          
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at support@matur.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    ...typography.title,
    color: colors.white,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.caption,
    color: colors.white,
    marginBottom: 16,
  },
});