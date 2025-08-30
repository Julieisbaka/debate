# Debate Vault Setup Guide

## Prerequisites

- [Obsidian](https://obsidian.md/) installed
- [Git](https://git-scm.com/) installed
- A GitHub account

## Setup Instructions

1. **Clone this repository**

 ```bash
 git clone https://github.com/Julieisbaka/debate.git
 ```

2. **Create a new Obsidian vault**

- Open Obsidian.
- Choose "Open folder as vault" and select the `Docs` folder inside the cloned repository.

3. **Install the Git Community Plugin in Obsidian**

- Go to Settings → Community plugins → Browse.
- Search for and install the "Obsidian Git" plugin.
- Enable the plugin.

4. **Configure the Git plugin**

- Set the commit message and auto-commit message to `Obsidian change` (case-sensitive).
- Authenticate with GitHub and connect the vault to the repository if prompted.

1. **Syncing Notes**

- Use the Git plugin to commit and push changes.
- When the commit message is `Obsidian change`, markdown files will be automatically moved to the `Docs/` folder if they are not there already and published to GitHub Pages.

---

For questions or issues, open an issue on GitHub.
