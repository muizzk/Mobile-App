#!/usr/bin/env ruby

# PARAM 1 - prod|staging|dev

def replace_line_in_file(file_name, line_pattern, replacement)
  text = File.read(file_name)
  puts("replacing '#{line_pattern}' with '#{replacement}'")
  new_contents = text.gsub(line_pattern, replacement)
  File.open(file_name, "w") {|file| file.puts new_contents }
end


# changes list
configs = ['prod', 'staging', 'dev', 'local']
select_config = ['src/config.js', 
        /const LT_CFG.*/,
        {
          'prod'    => "const LT_CFG = LT_PROD;",
          'staging' => "const LT_CFG = LT_STAGING;",
          'dev'     => "const LT_CFG = LT_DEV;",
          'local'   => "const LT_CFG = LT_LOCAL;",
        }
]

# execute
changes = [select_config]; # DISABLED
cfg = ARGV[0]

puts("\n")
if configs.index(cfg) != nil && ARGV.count == 1 && ['help','--help','/h','-h'].index(cfg) == nil
  puts("Selecting config: #{cfg}\n")
  puts("Executing #{changes.count} chang#{changes.count == 1 ? 'e' : 'es'}:")
  i=0
  changes.each do |item|
    file = item[0]
    regexp = item[1]
    repl = item[2][cfg]
    i+=1
    puts("  Executing change #{i}")
    puts("  --------------------------------")
    puts("  Reading file #{file}")
    puts("  Replacing regexp result of '#{regexp}' with '#{repl}'\n")
    replace_line_in_file(file, regexp, repl)
  end
else
  cmd = $0 #File.basename($0)
  puts("Usage:\n\t#{cmd} <#{configs.join('|')}>")
  puts("Examples:")
  puts("\t#{cmd} staging")
  puts("\t#{cmd} prod")
end
puts("\nDone.\n\n")