Pod::Spec.new do |s|
  s.name             = 'Helpers'
  s.version          = '2.33.1'
  s.summary          = 'Supabase Helpers SDK for Swift'
  s.homepage         = 'https://github.com/supabase/supabase-swift'
  s.license          = { :type => 'Apache 2.0' }
  s.author           = 'Supabase'
  s.source           = {
    :git => 'https://github.com/supabase/supabase-swift.git',
    :tag => "v#{s.version}"
  }

  s.swift_version = '5.10'
  s.source_files = 'Sources/Helpers/**/*.swift'
  s.module_name = 'Helpers'
  
  # Swift compiler flags for package access level
  s.pod_target_xcconfig = {
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited)',
    'OTHER_SWIFT_FLAGS' => '$(inherited) -package-name Supabase'
  }
  
  # Dependencies based on official Package.swift
  s.dependency 'ConcurrencyExtras'
  s.dependency 'HTTPTypes'
  s.dependency 'Clocks'
  s.dependency 'XCTestDynamicOverlay'
end