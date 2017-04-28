import * as React from "react";
import {observer} from "mobx-react";
import {computed} from "mobx";
import MutationTable from "shared/components/mutationTable/MutationTable";
import {IMutationTableProps} from "shared/components/mutationTable/MutationTable";
import SampleManager from "../sampleManager";
import {MutationTableColumnType} from "shared/components/mutationTable/MutationTable";
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import AlleleFreqColumnFormatter from "./column/AlleleFreqColumnFormatter";
import TumorColumnFormatter from "./column/TumorColumnFormatter";
import {Column} from "shared/components/lazyMobXTable/LazyMobXTable";
import ProteinChangeColumnFormatter from "./column/ProteinChangeColumnFormatter";

export interface IPatientViewMutationTableProps extends IMutationTableProps {
    sampleManager:SampleManager | null;
}

@observer
export default class PatientViewMutationTable extends MutationTable<IPatientViewMutationTableProps> {

    constructor(props:IPatientViewMutationTableProps) {
        super(props);
    }

    public static defaultProps =
    {
        ...MutationTable.defaultProps,
        initialItemsPerPage: 10,
        columns: [
            MutationTableColumnType.COHORT,
            MutationTableColumnType.MRNA_EXPR,
            MutationTableColumnType.COPY_NUM,
            MutationTableColumnType.ANNOTATION,
            MutationTableColumnType.REF_READS_N,
            MutationTableColumnType.VAR_READS_N,
            MutationTableColumnType.REF_READS,
            MutationTableColumnType.VAR_READS,
            MutationTableColumnType.START_POS,
            MutationTableColumnType.END_POS,
            MutationTableColumnType.REF_ALLELE,
            MutationTableColumnType.VAR_ALLELE,
            MutationTableColumnType.MUTATION_STATUS,
            MutationTableColumnType.VALIDATION_STATUS,
            MutationTableColumnType.CENTER,
            MutationTableColumnType.GENE,
            MutationTableColumnType.CHROMOSOME,
            MutationTableColumnType.PROTEIN_CHANGE,
            MutationTableColumnType.MUTATION_TYPE,
            MutationTableColumnType.MUTATION_ASSESSOR,
            MutationTableColumnType.COSMIC,
            MutationTableColumnType.TUMOR_ALLELE_FREQ,
            MutationTableColumnType.TUMORS
        ]
    };

    protected generateColumns() {
        super.generateColumns();

        this._columns[MutationTableColumnType.TUMOR_ALLELE_FREQ] = {
            name: "Allele Freq",
            render: (d:Mutation[])=>AlleleFreqColumnFormatter.renderFunction(d, this.props.sampleManager),
            sortBy:(d:Mutation[])=>AlleleFreqColumnFormatter.getSortValue(d, this.props.sampleManager),
            tooltip:(<span>Variant allele frequency in the tumor sample</span>)
        };

        this._columns[MutationTableColumnType.TUMORS] = {
            name: "Tumors",
            render:(d:Mutation[])=>TumorColumnFormatter.renderFunction(d, this.props.sampleManager),
            sortBy:(d:Mutation[])=>TumorColumnFormatter.getSortValue(d, this.props.sampleManager)
        };

        // patient view has a custom renderer for protein change column, so we need to override render function
        this._columns[MutationTableColumnType.PROTEIN_CHANGE].render = ProteinChangeColumnFormatter.renderFunction;


        // order columns
        this._columns[MutationTableColumnType.TUMORS].order = 5;
        this._columns[MutationTableColumnType.GENE].order = 20;
        this._columns[MutationTableColumnType.PROTEIN_CHANGE].order = 30;
        this._columns[MutationTableColumnType.ANNOTATION].order = 35;
        this._columns[MutationTableColumnType.CHROMOSOME].order = 40;
        this._columns[MutationTableColumnType.START_POS].order = 50;
        this._columns[MutationTableColumnType.END_POS].order = 60;
        this._columns[MutationTableColumnType.REF_ALLELE].order = 70;
        this._columns[MutationTableColumnType.VAR_ALLELE].order = 80;
        this._columns[MutationTableColumnType.MUTATION_STATUS].order = 90;
        this._columns[MutationTableColumnType.VALIDATION_STATUS].order = 100;
        this._columns[MutationTableColumnType.MUTATION_TYPE].order = 110;
        this._columns[MutationTableColumnType.CENTER].order = 120;
        this._columns[MutationTableColumnType.TUMOR_ALLELE_FREQ].order = 130;
        this._columns[MutationTableColumnType.VAR_READS].order = 140;
        this._columns[MutationTableColumnType.REF_READS].order = 150;
        this._columns[MutationTableColumnType.VAR_READS_N].order = 170;
        this._columns[MutationTableColumnType.REF_READS_N].order = 180;
        this._columns[MutationTableColumnType.COPY_NUM].order = 181;
        this._columns[MutationTableColumnType.MRNA_EXPR].order = 182;
        this._columns[MutationTableColumnType.COHORT].order = 183;
        this._columns[MutationTableColumnType.COSMIC].order = 184;
        this._columns[MutationTableColumnType.MUTATION_ASSESSOR].order = 190;
    }

    @computed protected get columns():Column<Mutation[]>[] {
        return this.orderedColumns.reduce((columns:Column<Mutation[]>[], next:MutationTableColumnType)=>{
            let column = this._columns[next];
            let shouldAdd = true;

            if (next === MutationTableColumnType.MRNA_EXPR &&
                (!this.props.mrnaExprRankGeneticProfileId
                || this.getSamples().length > 1)) {
                shouldAdd = false;
            } else if (next === MutationTableColumnType.TUMORS && this.getSamples().length < 2) {
                shouldAdd = false;
            } else if (next === MutationTableColumnType.COPY_NUM && (!this.props.discreteCNAGeneticProfileId || this.getSamples().length > 1)) {
                shouldAdd = false;
            }

            // actual column definition may be missing for a specific enum
            if (column && shouldAdd) {
                columns.push(this._columns[next]);
            }

            return columns;
        }, []);
    }
}
