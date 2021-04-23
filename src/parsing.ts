import Tracker from "./main";
import { RenderInfo, SummaryInfo } from "./data";
import { TFolder, normalizePath } from "obsidian";
import * as Yaml from "yaml";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";

export function getRenderInfoFromYaml(
    yamlText: string,
    plugin: Tracker
): RenderInfo | string {
    let yaml;
    try {
        yaml = Yaml.parse(yamlText);
    } catch (err) {
        let errorMessage = "Error parsing YAML";
        console.log(err);
        return errorMessage;
    }
    if (!yaml) {
        let errorMessage = "Error parsing YAML";
        return errorMessage;
    }
    // console.log(yaml);

    // Search type
    let searchType = "";
    if (
        yaml.searchType === "tag" ||
        yaml.searchType === "text" ||
        yaml.searchType === "frontmatter" ||
        yaml.searchType === "wiki"
    ) {
        searchType = yaml.searchType;
    } else {
        let errorMessage =
            "Invalid search type (searchType), choose 'tag', 'frontmatter', 'wiki', or 'text'";
        return errorMessage;
    }
    // console.log(searchType);

    // Search target
    let searchTarget = "";
    if (typeof yaml.searchTarget === "string" && yaml.searchTarget !== "") {
        if (yaml.searchType === "tag") {
            if (
                yaml.searchTarget.startsWith("#") &&
                yaml.searchTarget.length > 2
            ) {
                searchTarget = yaml.searchTarget.substring(1);
            } else {
                searchTarget = yaml.searchTarget;
            }
        } else {
            // yaml.searchType === "text", "frontmatter", "wiki"
            searchTarget = yaml.searchTarget;
        }
    } else {
        let errorMessage = "Invalid search target (searchTarget)";
        return errorMessage;
    }
    // console.log(searchTarget);

    // Create grarph info
    let renderInfo = new RenderInfo(searchType, searchTarget);

    // Get daily notes settings using obsidian-daily-notes-interface
    let dailyNotesSettings = getDailyNoteSettings();

    // Root folder to search
    if (typeof yaml.folder === "string") {
        if (yaml.folder === "") {
            renderInfo.folder = plugin.settings.folder;
        } else {
            renderInfo.folder = yaml.folder;
        }
    } else {
        renderInfo.folder = plugin.settings.folder;
    }
    // console.log("renderInfo folder: " + renderInfo.folder);

    let abstractFolder = plugin.app.vault.getAbstractFileByPath(
        normalizePath(renderInfo.folder)
    );
    if (!abstractFolder || !(abstractFolder instanceof TFolder)) {
        let errorMessage = "Folder '" + renderInfo.folder + "' doesn't exist";
        return errorMessage;
    }

    // Date format
    const dateFormat = yaml.dateFormat;
    //?? not sure why I need this to make it works,
    // without that, the assigned the renderInfo.dateFormat will become undefined
    if (typeof yaml.dateFormat === "string") {
        if (yaml.dateFormat === "") {
            renderInfo.dateFormat = plugin.settings.dateFormat;
        } else {
            renderInfo.dateFormat = dateFormat;
        }
    } else {
        renderInfo.dateFormat = plugin.settings.dateFormat;
    }
    // console.log("renderInfo dateFormat: " + renderInfo.dateFormat);

    // startDate, endDate
    if (typeof yaml.startDate === "string") {
        let startDate = window.moment(
            yaml.startDate,
            renderInfo.dateFormat,
            true
        );
        if (startDate.isValid()) {
            renderInfo.startDate = startDate;
        } else {
            let errorMessage =
                "The format of startDate doesn't fit your dateFormat " +
                renderInfo.dateFormat;
            return errorMessage;
        }
    }
    if (typeof yaml.endDate === "string") {
        let endDate = window.moment(yaml.endDate, renderInfo.dateFormat, true);
        if (endDate.isValid()) {
            renderInfo.endDate = endDate;
        } else {
            let errorMessage =
                "The format of endDate doesn't fit your dateFormat " +
                renderInfo.dateFormat;
            return errorMessage;
        }
    }
    if (renderInfo.startDate.isValid() && renderInfo.endDate.isValid()) {
        // Make sure endDate > startDate
        if (renderInfo.endDate < renderInfo.startDate) {
            let errorMessage =
                "Invalid date range (startDate larger than endDate)";
            return errorMessage;
        }
    }
    // console.log(renderInfo.startDate);
    // console.log(renderInfo.endDate);

    // constValue
    if (typeof yaml.constValue === "number") {
        renderInfo.constValue = yaml.constValue;
    }

    // ignoreAttachedValue
    if (typeof yaml.ignoreAttachedValue === "boolean") {
        renderInfo.ignoreAttachedValue = yaml.ignoreAttachedValue;
    }

    // ignoreZeroValue
    if (typeof yaml.ignoreZeroValue === "boolean") {
        renderInfo.ignoreZeroValue = yaml.ignoreZeroValue;
    }

    // accum
    if (typeof yaml.accum === "boolean") {
        renderInfo.accum = yaml.accum;
    }
    // console.log(renderInfo.accum);

    // penalty
    if (typeof yaml.penalty === "number") {
        renderInfo.penalty = yaml.penalty;
    }
    // console.log(renderInfo.penalty);

    // line related parameters
    if (typeof yaml.output !== "undefined") {
        renderInfo.output = yaml.output;
    }
    if (typeof yaml.line !== "undefined") {
        // title
        if (typeof yaml.line.title === "string") {
            renderInfo.line.title = yaml.line.title;
        }
        // xAxisLabel
        if (typeof yaml.line.xAxisLabel === "string") {
            renderInfo.line.xAxisLabel = yaml.line.xAxisLabel;
        }
        // yAxisLabel
        if (typeof yaml.line.yAxisLabel === "string") {
            renderInfo.line.yAxisLabel = yaml.line.yAxisLabel;
        }
        // labelColor
        if (typeof yaml.line.labelColor === "string") {
            renderInfo.line.labelColor = yaml.line.labelColor;
        }
        // yAxisUnit
        if (typeof yaml.line.yAxisUnit === "string") {
            renderInfo.line.yAxisUnit = yaml.line.yAxisUnit;
        }
        // yAxisLocation
        if (typeof yaml.line.yAxisLocation === "string") {
            if (
                yaml.line.yAxisLocation === "left" ||
                yaml.line.yAxisLocation === "right"
            ) {
                renderInfo.line.yAxisLocation = yaml.line.yAxisLocation;
            }
        }
        // yMin
        if (typeof yaml.line.yMin === "number") {
            renderInfo.line.yMin = yaml.line.yMin;
        }
        // yMax
        if (typeof yaml.line.yMax === "number") {
            renderInfo.line.yMax = yaml.line.yMax;
        }
        // axisColor
        if (typeof yaml.line.axisColor === "string") {
            renderInfo.line.axisColor = yaml.line.axisColor;
        }
        // lineColor
        if (typeof yaml.line.lineColor === "string") {
            renderInfo.line.lineColor = yaml.line.lineColor;
        }
        // lineWidth
        if (typeof yaml.line.lineWidth === "number") {
            renderInfo.line.lineWidth = yaml.line.lineWidth;
        }
        // showLine
        if (typeof yaml.line.showLine === "boolean") {
            renderInfo.line.showLine = yaml.line.showLine;
        }
        // showPoint
        if (typeof yaml.line.showPoint === "boolean") {
            renderInfo.line.showPoint = yaml.line.showPoint;
        }
        // pointColor
        if (typeof yaml.line.pointColor === "string") {
            renderInfo.line.pointColor = yaml.line.pointColor;
        }
        // pointBorderColor
        if (typeof yaml.line.pointBorderColor === "string") {
            renderInfo.line.pointBorderColor = yaml.line.pointBorderColor;
        }
        // pointBorderWidth
        if (typeof yaml.line.pointBorderWidth === "number") {
            renderInfo.line.pointBorderWidth = yaml.line.pointBorderWidth;
        }
        // pointSize
        if (typeof yaml.line.pointSize === "number") {
            renderInfo.line.pointSize = yaml.line.pointSize;
        }
        // allowInspectData
        if (typeof yaml.line.allowInspectData === "boolean") {
            renderInfo.line.allowInspectData = yaml.line.allowInspectData;
        }
        // fillGap
        if (typeof yaml.line.fillGap === "boolean") {
            renderInfo.line.fillGap = yaml.line.fillGap;
        }
        // console.log(renderInfo.line.fillGap)
    } // line related parameters

    // summary related parameters
    if (typeof yaml.summary !== "undefined") {
        renderInfo.summary = new SummaryInfo();
        // template
        if (typeof yaml.summary.template === "string") {
            renderInfo.summary.template = yaml.summary.template;
        }
        if (typeof yaml.summary.style === "string") {
            renderInfo.summary.style = yaml.summary.style;
        }
    } // summary related parameters

    return renderInfo;
}
