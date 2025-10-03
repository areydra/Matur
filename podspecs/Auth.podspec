Pod::Spec.new do |s|
  s.name             = 'Auth'
  s.version          = '2.33.1'
  s.summary          = 'Supabase Auth SDK for Swift'
  s.homepage         = 'https://github.com/supabase/supabase-swift'
  s.license          = { :type => 'Apache 2.0' }
  s.author           = 'Supabase'
  s.source           = {
    :git => 'https://github.com/supabase/supabase-swift.git',
    :tag => "v#{s.version}"
  }

  s.swift_version = '5.10'
  s.source_files = 'Sources/Auth/**/*.swift'
  s.module_name = 'Auth'
  
  # Swift compiler flags for package access level
  s.pod_target_xcconfig = {
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited)',
    'OTHER_SWIFT_FLAGS' => '$(inherited) -package-name Supabase'
  }

  # Dependencies based on official Package.swift
  s.dependency 'ConcurrencyExtras'
  s.dependency 'Crypto'
  s.dependency 'Helpers'
end