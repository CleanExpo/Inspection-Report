# Backup Instructions

## Creating the Backup
1. Ensure you are in the current working directory: `c:/VSCode/inspection-report`
2. Use the list_files tool to get an overview of the project files and directories:

```
<list_files>
<path>.</path>
<recursive>true</recursive>
</list_files>
```

3. Create a ZIP archive containing the project files and directories:

```
<write_to_file>
<path>inspection-report.zip</path>
<content>
[Placeholder for compressed project files]
