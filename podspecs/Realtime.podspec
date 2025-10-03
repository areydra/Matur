Pod::Spec.new do |s|
  s.name             = 'Realtime'
  s.version          = '2.33.1'
  s.summary          = 'Supabase Realtime SDK for Swift'
  s.homepage         = 'https://github.com/supabase/supabase-swift'
  s.license          = { :type => 'Apache 2.0' }
  s.author           = 'Supabase'
  s.source           = {
    :git => 'https://github.com/supabase/supabase-swift.git',
    :tag => "v#{s.version}"
  }

  s.swift_version = '5.10'
  s.source_files = 'Sources/Realtime/**/*.swift'
  s.module_name = 'Realtime'
  
  # Swift compiler flags for package access level
  s.pod_target_xcconfig = {
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited)',
    'OTHER_SWIFT_FLAGS' => '$(inherited) -package-name Supabase'
  }

  s.dependency 'Helpers'
  s.dependency 'HTTPTypes'
  s.dependency 'ConcurrencyExtras'
  s.dependency 'IssueReporting'
end