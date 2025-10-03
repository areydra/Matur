Pod::Spec.new do |s|
  s.name             = 'XCTestDynamicOverlay'
  s.version          = '1.4.2'
  s.summary          = 'Define XCTest assertion helpers directly in your application and library code.'
  s.homepage         = 'https://github.com/pointfreeco/xctest-dynamic-overlay'
  s.license          = { :type => 'MIT' }
  s.author           = 'Point-Free'
  s.source           = {
    :git => 'https://github.com/pointfreeco/xctest-dynamic-overlay.git',
    :tag => "#{s.version}"
  }

  s.swift_version = '6.0'
  s.ios.deployment_target = '13.0'
  s.osx.deployment_target = '10.15'
  s.tvos.deployment_target = '13.0'
  s.watchos.deployment_target = '6.0'
  
  s.source_files = 'Sources/XCTestDynamicOverlay/**/*.swift'
  s.module_name = 'XCTestDynamicOverlay'
  
  # Swift compiler flags for package access level
  s.pod_target_xcconfig = {
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited)',
    'OTHER_SWIFT_FLAGS' => '$(inherited) -package-name IssueReporting'
  }
  
  # Dependencies based on Package.swift
  s.dependency 'IssueReporting'
end