export interface MiniKanbanType {
  name: string;
  numOfKanban: string;
  data: MiniKanbanDataType[];
}

export interface MiniKanbanDataType {
  companyImgUrl: string;
  companyCategory: string;
  companyName: string;
  position: string;
  eventDate: Date;
}
