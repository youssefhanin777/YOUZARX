const {
      Client,
      MessageButton,
      MessageActionRow,
      MessageSelectMenu,
      TextInputComponent,
      Modal,
      MessageEmbed,
    } = require("discord.js");
    const config = require("./config.json");
    const { Database } = require("st.db");
    const temp_channels_db = new Database("./temp_channels.json");

    const http = require("http");
    http
      .createServer(function (req, res) {
        res.write("I'm alive");
        res.end();
      })
      .listen(8080);

    const client = new Client({
      intents: 32767,
    });

    client.on("ready", async () => {
      console.log("Bot is online!");
      console.log("Code by Youzarx");
      console.log(" discord.gg/msh");
    });

    client.on("messageCreate", async (message) => {
      if (message.author.bot || !message.guild) return;
      if (message.content.startsWith(config.prefix + "temp")) {


        let args = message.content.split(" ");
        let embeds = [
          {
            author: {
              icon_url: message.guild.iconURL(),
            },
            content: `{USER_MENTION}`,
            title: "***Beta Tempvoice <:modshield_lightred_icon:1209447942931480607>***",
            description: `**Press the buttons below to control your audio ROM , Youzarx Heeree .**`,
            image: {
              url: `https://media.discordapp.net/attachments/1208560411931181106/1209453226819194880/Design_sans_titre.jpg?ex=65e6fa17&is=65d48517&hm=e60205e1c0c16e0adf9807df199e3ae57851b4982e5c7d3f0b4307666a5a3249&=&format=webp&width=1332&height=614`,
            footer:{
        text:`Protected By Youzarx`,
        icon_url: `https://media.discordapp.net/attachments/1209438357055078421/1209443331952869386/Design_sans_titre__1_-removebg-preview.png?ex=65e6f0e0&is=65d47be0&hm=f3c4a2e990ef99da21e87f3a3161b0a1be2e998d526bd256b12d6d13608ab0ae&=&format=webp&quality=lossless`
      },
      image: {
        url: `https://media.discordapp.net/attachments/1209438357055078421/1209438447366967306/Design_sans_titre.png?ex=65e6ec54&is=65d47754&hm=62e04dc96c3bc4c3fcd4358ebfdf29d616d03403b77266f4b2024f2512aa307d&=&format=webp&quality=lossless&width=1100&height=614`
      }
            },

          },
        ];
        let MessageSelectMenuOptions = [];
        config.voiceLimits.forEach((num) => {
          MessageSelectMenuOptions.push({
            label: `${num == 0 ? "No Limit" : num}`,
            value: `${num}`,
          });
        });

        let row1 = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`temp_public_${Date.now()}`)
            .setStyle("SECONDARY")
            .setEmoji(config.emojis.public)
            .setLabel("Unlock"),
          new MessageButton()
            .setCustomId(`temp_private_${Date.now()}`)
            .setStyle("SECONDARY")
            .setEmoji(config.emojis.private)
            .setLabel("Lock"),
          new MessageButton()
            .setCustomId(`temp_unmute_${Date.now()}`)
            .setStyle("SECONDARY")
            .setEmoji(config.emojis.unmute)
            .setLabel("Unmute"),
          new MessageButton()
            .setCustomId(`temp_mute_${Date.now()}`)
            .setStyle("SECONDARY")
            .setEmoji(config.emojis.mute)
            .setLabel("Mute"),
          new MessageButton()
            .setCustomId(`temp_rename_${Date.now()}`)
            .setStyle("SECONDARY")
            .setEmoji(config.emojis.rename)
            .setLabel("Change Name"),
        );

        let row2 = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`temp_disconnect_${Date.now()}`)
            .setStyle("DANGER")
            .setEmoji(config.emojis.disconnect)
            .setLabel("Disconnect"),
          new MessageButton()
            .setCustomId(`temp_hide_${Date.now()}`)
            .setStyle("PRIMARY")
            .setEmoji(config.emojis.hide)
            .setLabel("Hide"),
          new MessageButton()
            .setCustomId(`temp_unhide_${Date.now()}`)
            .setStyle("PRIMARY")
            .setEmoji(config.emojis.unhide)
            .setLabel("Unhide"),
          new MessageButton()
            .setCustomId(`temp_kickuser_${Date.now()}`)
            .setStyle("PRIMARY")
            .setEmoji(config.emojis.unhide)
            .setLabel("Kick User"),
        );

        let row3 = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("temp_limit_" + Date.now())
            .setPlaceholder("Number of members who can enter")
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(MessageSelectMenuOptions),
        );

        message.channel
          .send({ embeds, components: [row1, row2, row3] })
          .then(() => {
            message.delete().catch(() => {});
          });
      }
    });

    client.on("voiceStateUpdate", async (oldState, newState) => {
      if (
        newState.channelId !== null &&
        newState.channelId == config.channelVoiceId
      ) {
        newState.guild.channels
          .create(newState.member.user.username, {
            permissionOverwrites: [
              {
                id: newState.member.id,
                allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_CHANNELS"],
              },
              {
                id: newState.guild.id,
                deny: ["SEND_MESSAGES"],
              },
            ],
            parent: config.categoryId,
            type: 2,
            reason: "Temp channel Bot Youzarx",
          })
          .then(async (channeltemp) => {
            await newState.setChannel(channeltemp, "Temp channel Bot by Youzarx");
            await temp_channels_db.set(channeltemp.id, newState.member.id);
          })
          .catch(console.error);
      }

      if (oldState.channelId !== null && temp_channels_db.has(oldState.channelId)) {
        if (oldState.channel.members.filter((x) => !x.user.bot).size == 0) {
          let channel = oldState.guild.channels.cache.get(oldState.channelId);
          await channel.delete();
          await temp_channels_db.delete(oldState.channelId);
        }
      }
    });

    client.on("interactionCreate", async (interaction) => {
      if (interaction.isSelectMenu()) {
        if (interaction.customId.startsWith("temp_limit")) {
          if (
            interaction.member.voice.channelId == null ||
            (interaction.member.voice.channelId !== null &&
              !temp_channels_db.has(interaction.member.voice.channelId))
          )
            return await interaction.reply({
              content: "You Don't Have a Channel ❌",
              ephemeral: true,
            });
          if (
            !interaction.member.voice.channel
              .permissionsFor(interaction.member)
              .has("MANAGE_CHANNELS")
          )
            return await interaction.reply({
              content: "You do not have permission to control the temporary channel ❌",
              ephemeral: true,
            });

          await interaction.deferReply({ ephemeral: true });
          await interaction.member.voice.channel
            .setUserLimit(+interaction.values[0])
            .catch(console.error);

          await interaction.editReply({
            embeds: [
              {
                title: "Done ✅",
                fields: [
                  {
                    name: "Selected Channel",
                    value: `<#${interaction.member.voice.channelId}>`,
                  },
                ],
                color: 0x0cd8fa,
                timestamp: new Date(),
              },
            ],
            ephemeral: true,
          });
        }
      }
      if (interaction.customId.startsWith("temp_rename")) {
        if (interaction.isModalSubmit()) {
          await interaction.reply({
            ephemeral: true,
            embeds: [
              {
                title: "Please Wait",
                description: `Your Temp Channel is Changing`,
                fields: [
                  {
                    name: "Note:",
                    value:
                      "Warning: If you change your name more than twice, you cannot change your new name again for 10 minutes",
                  },
                ],
                color: 0x0cd8fa,
              },
            ],
          });
          let guild = await client.guilds.fetch(interaction.guildId);
          let channel = await guild.channels.cache.get(
            interaction.customId.split("_")[2],
          );
          await channel
            .edit({
              name: interaction.fields.getTextInputValue("new_name"),
            })
            .catch(console.error);
          await interaction.editReply({
            embeds: [
              {
                title: "Done ✅",
                fields: [
                  {
                    name: "Selected Channel",
                    value: `<#${interaction.member.voice.channelId}>`,
                  },
                ],
                color: 0x0cd8fa,
                timestamp: new Date(),
              },
            ],
            ephemeral: true,
          });
        }
      }
      if (interaction.customId.startsWith("temp_kick_confirm")) {
        const channelId = interaction.customId.split("_")[3];
        const selectedMemberId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);
        const memberToKick = interaction.guild.members.cache.get(selectedMemberId);
        if (memberToKick) {
          await memberToKick.voice.disconnect(
            "Kicked from the temp channel by owner.",
          );
        }
        const kickConfirmationEmbed = new MessageEmbed()
          .setColor("#FF0000")
          .setTitle("Member Kicked")
          .setDescription(
            `Kicked ${memberToKick.displayName} from the temp channel.`,
          );

        await interaction.reply({
          embeds: [kickConfirmationEmbed],
          ephemeral: true,
        });
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith("temp")) {
          if (
            interaction.member.voice.channelId == null ||
            (interaction.member.voice.channelId !== null &&
              !temp_channels_db.has(interaction.member.voice.channelId))
          ) {
            return await interaction.reply({
              embeds: [
                { color: "RED", description: "You Don't Have a Channel ❌" },
              ],
              ephemeral: true,
            });
          }
          if (
            !interaction.member.voice.channel
              .permissionsFor(interaction.member)
              .has("MANAGE_CHANNELS")
          ) {
            return await interaction.reply({
              embeds: [
                {
                  color: "RED",
                  description:
                    "You do not have permission to control the temporary Channel ❌",
                },
              ],
              ephemeral: true,
            });
          }
          const channelOwnerId = temp_channels_db.get(
            interaction.member.voice.channelId,
          );
          if (interaction.member.id !== channelOwnerId) {
            return await interaction.reply({
              embeds: [
                {
                  color: "RED",
                  description: "You are not the owner of this channel ❌",
                },
              ],
              ephemeral: true,
            });
          }
          try {
            switch (interaction.customId.split("_")[1]) {
              case "rename":
                const modal = new Modal()
                  .setCustomId(`temp_rename_${interaction.member.voice.channelId}`)
                  .setTitle("Rename");
                const NewName = new TextInputComponent()
                  .setCustomId("new_name")
                  .setLabel("New Name")
                  .setStyle("SHORT");
                const firstActionRow = new MessageActionRow().addComponents(
                  NewName,
                );
                modal.addComponents(firstActionRow);
                await interaction.showModal(modal);
                break;
              case "private":
                await interaction.member.voice.channel.permissionOverwrites.edit(
                  interaction.guild.id,
                  { VIEW_CHANNEL: false },
                );
                await interaction.reply({
                  embeds: [
                    {
                      color: "GREEN",
                      description:
                        "This channel is now private. Only selected members can view it.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "public":
                await interaction.member.voice.channel.permissionOverwrites.edit(
                  interaction.guild.id,
                  { VIEW_CHANNEL: true },
                );
                await interaction.reply({
                  embeds: [
                    {
                      color: "GREEN",
                      description:
                        "This channel is now public. Everyone can view it.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "unmute":
                await interaction.member.voice.channel.permissionOverwrites.edit(
                  interaction.guild.id,
                  { SPEAK: true },
                );
                await interaction.reply({
                  embeds: [
                    {
                      color: "GREEN",
                      description:
                        "Channel is now unmuted. Members can speak freely.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "mute":
                await interaction.member.voice.channel.permissionOverwrites.edit(
                  interaction.guild.id,
                  { SPEAK: false },
                );
                await interaction.reply({
                  embeds: [
                    {
                      color: "GREEN",
                      description: "Channel is now muted. Members cannot speak.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "disconnect":
                await interaction.member.voice.disconnect();
                await interaction.reply({
                  embeds: [
                    {
                      color: "ORANGE",
                      description:
                        "You have been disconnected from the voice channel.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "hide":
                await interaction.member.voice.channel.permissionOverwrites.edit(
                  interaction.guild.id,
                  { VIEW_CHANNEL: false },
                );
                await interaction.reply({
                  embeds: [
                    {
                      color: "GREEN",
                      description: "This channel is now hidden from non-members.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "unhide":
                await interaction.member.voice.channel.permissionOverwrites.edit(
                  interaction.guild.id,
                  { VIEW_CHANNEL: true },
                );
                await interaction.reply({
                  embeds: [
                    {
                      color: "GREEN",
                      description: "This channel is now visible to everyone.",
                    },
                  ],
                  ephemeral: true,
                });
                break;
              case "kickuser":
                if (!interaction.member.voice.channel) return;
                if (!temp_channels_db.has(interaction.member.voice.channelId))
                  return;

                const memberOptions = [];
                interaction.member.voice.channel.members.forEach((member) => {
                  if (!member.user.bot) {
                    memberOptions.push({
                      label: member.displayName,
                      value: member.id,
                    });
                  }
                });

                const kickSelectMenu = new MessageSelectMenu()
                  .setCustomId(
                    "temp_kick_confirm_" +
                      interaction.member.voice.channelId +
                      "_" +
                      Date.now(),
                  )
                  .setPlaceholder("Select Member to Kick")
                  .addOptions(memberOptions);

                const actionRow = new MessageActionRow().addComponents(
                  kickSelectMenu,
                );

                await interaction.reply({
                  content: "Select a member to kick:",
                  components: [actionRow],
                  ephemeral: true,
                });
                break;
              default:
                await interaction.reply({
                  embeds: [{ color: "RED", description: "Unknown command." }],
                  ephemeral: true,
                });
            }
          } catch (error) {
            console.error(error);
            await interaction.reply({
              embeds: [
                {
                  color: "RED",
                  description: "An error occurred while processing your request.",
                },
              ],
              ephemeral: true,
            });
          }
        }
      }
    });

//-------------------------------------------------
    const statuses = [
        ' | 🛡️ !temp'
    ];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(statuses[i], {
            type: 'STREAMING',
            url: 'https://www.twitch.tv/youzarx'
        });
        i = ++i % statuses.length;
    }, 1e4);
//-------------------------------------------------


    client.login(process.env.token);