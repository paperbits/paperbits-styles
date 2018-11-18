/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as Utils from "@paperbits/common/utils";
import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { StyleService } from "../styleService";
import { StyleCompiler } from "../styleCompiler";

export class StylePublisher implements IPublisher {
    constructor(
        private readonly styleService: StyleService,
        private readonly outputBlobStorage: IBlobStorage,
    ) {
        this.publish = this.publish.bind(this);
    }

    public async publish(): Promise<void> {
        const styles = await this.styleService.getStyles();
        const compiler = new StyleCompiler(styles);
        const css = compiler.compile();
        const bytes = Utils.stringToUnit8Array(css);

        await this.outputBlobStorage.uploadBlob(`website\\styles\\customizations.css`, bytes);
    }
}