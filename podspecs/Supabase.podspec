Pod::Spec.new do |s|
  s.name             = 'Supabase'
  s.version          = '2.33.1' # Remove the 'v' prefix
  s.summary          = 'Supabase SDK for Swift'
  s.homepage         = 'https://github.com/supabase/supabase-swift'
  s.license          = { :type => 'Apache 2.0' }
  s.author           = 'Supabase'
  s.source           = {
    :git => 'https://github.com/supabase/supabase-swift.git',
    :tag => "v#{s.version}" # Prepend 'v' to match the GitHub tag
  }

  s.swift_version = '5.10'
  s.source_files = 'Sources/Supabase/**/*.swift'
  s.module_name = 'Supabase'
  
  # Swift compiler flags for package access level
  s.pod_target_xcconfig = {
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited)',
    'OTHER_SWIFT_FLAGS' => '$(inherited) -package-name Supabase'
  }
  
  # Dependencies on individual Supabase libraries
  s.dependency 'Auth'
  s.dependency 'Functions'
  s.dependency 'PostgREST'
  s.dependency 'Realtime'
  s.dependency 'Storage'
  s.dependency 'Helpers'
end