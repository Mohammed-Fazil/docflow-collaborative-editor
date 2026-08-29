import { Extension } from "@tiptap/core";

import { Plugin } from "@tiptap/pm/state";

import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const RemoteCursorExtension = Extension.create({

    name: "remoteCursor",

    addOptions() {

        return {

            cursorUsers: {},
        };
    },

    addProseMirrorPlugins() {

        return [

            new Plugin({

                props: {

                    decorations: (state) => {
                        console.log("Remote Cursor Users:", this.options.cursorUsers);

                        const decorations = [];

                        Object.entries(

                            this.options.cursorUsers || {}

                        ).forEach(

                            ([email, position]) => {

                                try {

                                    const label =

                                        document.createElement("span");

                                    label.className =
                                        "remote-cursor-label";

                                    label.innerHTML =
                                        `🟢 ${email}`;

                                    decorations.push(

                                        Decoration.widget(

                                            position,

                                            label
                                        )
                                    );

                                } catch (error) {

                                    console.error(error);
                                }
                            }
                        );

                        return DecorationSet.create(

                            state.doc,

                            decorations
                        );
                    },
                },
            }),
        ];
    },
});