import useSetupAccount from '@/hooks/screens/useSetupAccount';
import { colors, spacing, typography } from '@/src/utils/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, ColorValue, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupAccountScreen() {
  const {
    name,
    nameError,
    loading,
    image,
    validateName,
    handleImagePick,
    handleNameChange,
    handleSubmit,
  } = useSetupAccount();

  return (
    <SafeAreaView style={styles.container}>      
      <Text style={styles.title}>Setup Account</Text>
      <Text style={styles.subtitle}>Fill your account information below</Text>
      
      <TouchableOpacity 
        style={styles.imagePickerContainer}
        onPress={handleImagePick}
      >
        {image ? (
          <Image 
            source={{ uri: image }}
            style={styles.profileImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.cameraIconContainer}>
            <Image 
              source={require('@/assets/images/camera-icon.svg')}
              style={styles.cameraIcon}
              contentFit="contain"
            />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          placeholder="Enter your name"
          placeholderTextColor="#666666"
          value={name}
          onChangeText={handleNameChange}
          onBlur={() => validateName(name)}
        />
        {nameError && (
          <Text style={styles.errorText}>{nameError}</Text>
        )}
      </View>
      
       <TouchableOpacity
        style={styles.submitButtonContainer}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={loading}
      >
        <LinearGradient
          colors={colors.gradient.button as [ColorValue, ColorValue]}
          style={styles.submitButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>✓</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.caption,
    color: colors.blueLight,
    marginBottom: spacing.xxl,
  },
  imagePickerContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 40,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#2D2A5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 40,
    height: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    lineHeight: 20,
    backgroundColor: colors.purpleSoft,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.white,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.red,
  },
  errorText: {
    ...typography.sm,
    color: colors.red,
    marginTop: 4,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 40,
    right: 24,
  },
  submitButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5D5FEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});