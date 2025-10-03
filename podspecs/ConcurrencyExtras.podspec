Pod::Spec.new do |s|
  s.name             = 'ConcurrencyExtras'
  s.version          = '1.2.0'
  s.summary          = 'Useful, testable Swift concurrency'
  s.homepage         = 'https://github.com/pointfreeco/swift-concurrency-extras'
  s.license          = { :type => 'MIT' }
  s.author           = 'Point-Free'
  s.source           = {
    :git => 'https://github.com/pointfreeco/swift-concurrency-extras.git',
    :tag => "#{s.version}"
  }

  s.swift_version = '6.0'
  s.ios.deployment_target = '13.0'
  s.osx.deployment_target = '10.15'
  s.tvos.deployment_target = '13.0'
  s.watchos.deployment_target = '6.0'
  
  s.source_files = 'Sources/ConcurrencyExtras/**/*.swift'
  s.module_name = 'ConcurrencyExtras'
end